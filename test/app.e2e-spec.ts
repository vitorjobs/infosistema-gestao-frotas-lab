import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import request from 'supertest';
import { Repository } from 'typeorm';
import { User } from '../src/usuarios/entities/usuario.entity';
import { TestAppModule } from './test-app.module';

describe('Fleet API (e2e)', () => {
  let app: INestApplication;
  let usersRepo: Repository<User>;
  let token = '';

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [TestAppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();

    usersRepo = moduleRef.get(getRepositoryToken(User));
    await usersRepo.save({
      nickname: 'aivacol',
      name: 'Aivacol Admin',
      email: 'aivacol@example.com',
      password_hash: await bcrypt.hash('aivacol', 10),
      created_by: 'system',
    });

    const login = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ nickname: 'aivacol', password: 'aivacol' })
      .expect(200);

    token = login.body.access_token;
  });

  afterAll(async () => {
    if (app) await app.close();
  });

  it('GET /api/models retorna 401 sem JWT', () =>
    request(app.getHttpServer()).get('/api/models').expect(401));

  it('POST /api/auth/login retorna 401 com credenciais invalidas', () =>
    request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ nickname: 'aivacol', password: 'wrong' })
      .expect(401));

  it('GET /api/auth/me retorna usuario autenticado', () =>
    request(app.getHttpServer())
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .expect((res: request.Response) => {
        expect(res.body.nickname).toBe('aivacol');
      }));

  it('fluxo CRUD de marca, modelo e veiculo', async () => {
    const marca = await request(app.getHttpServer())
      .post('/api/brands')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Toyota' })
      .expect(201);

    const modelo = await request(app.getHttpServer())
      .post('/api/models')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Corolla', brand_id: marca.body.id })
      .expect(201);

    const veiculo = await request(app.getHttpServer())
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${token}`)
      .send({
        license_plate: 'abc1d23',
        chassis: '9bwzzz377vt004251',
        renavam: '12345678901',
        year: 2024,
        model_id: modelo.body.id,
      })
      .expect(201);

    expect(veiculo.body.license_plate).toBe('ABC1D23');

    const list = await request(app.getHttpServer())
      .get('/api/vehicles?page=1&limit=10')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(list.body.data).toHaveLength(1);
    expect(list.body.meta.total).toBe(1);

    await request(app.getHttpServer())
      .patch(`/api/vehicles/${veiculo.body.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ year: 2025 })
      .expect(200);

    await request(app.getHttpServer())
      .delete(`/api/vehicles/${veiculo.body.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(204);

    await request(app.getHttpServer())
      .delete(`/api/models/${modelo.body.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(204);

    await request(app.getHttpServer())
      .delete(`/api/brands/${marca.body.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(204);
  });

  it('GET /api/users retorna lista paginada sem senha', () =>
    request(app.getHttpServer())
      .get('/api/users?page=1&limit=10')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .expect((res: request.Response) => {
        expect(res.body.data[0]).not.toHaveProperty('password_hash');
        expect(res.body.meta.total).toBeGreaterThanOrEqual(1);
      }));

  it('POST /api/brands retorna 400 com payload invalido', () =>
    request(app.getHttpServer())
      .post('/api/brands')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: '' })
      .expect(400)
      .expect((res: request.Response) => {
        expect(res.body.success).toBe(false);
        expect(res.body.error.message).toContain('Validacao falhou');
      }));

  it('POST /api/brands retorna 409 para nome duplicado', async () => {
    await request(app.getHttpServer())
      .post('/api/brands')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'DuplicateBrand' })
      .expect(201);

    await request(app.getHttpServer())
      .post('/api/brands')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'DuplicateBrand' })
      .expect(409)
      .expect((res: request.Response) => {
        expect(res.body.error.code).toBe('UniqueConstraintViolation');
      });
  });
});
