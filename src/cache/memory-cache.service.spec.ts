import { MemoryCacheService } from './memory-cache.service';

describe('MemoryCacheService', () => {
  let cache: MemoryCacheService;

  beforeEach(() => {
    cache = new MemoryCacheService();
  });

  it('armazena e recupera valores', async () => {
    await cache.set('vehicle:1', { id: 1, plate: 'ABC1D23' });
    await expect(cache.get('vehicle:1')).resolves.toEqual({ id: 1, plate: 'ABC1D23' });
  });

  it('remove chave individual', async () => {
    await cache.set('vehicle:1', { id: 1 });
    await cache.del('vehicle:1');
    await expect(cache.get('vehicle:1')).resolves.toBeNull();
  });

  it('remove chaves por prefixo', async () => {
    await cache.set('vehicles:page:1:20', { data: [] });
    await cache.set('vehicles:page:2:20', { data: [] });
    await cache.set('vehicle:1', { id: 1 });

    await cache.delByPrefix('vehicles:page:');

    await expect(cache.get('vehicles:page:1:20')).resolves.toBeNull();
    await expect(cache.get('vehicles:page:2:20')).resolves.toBeNull();
    await expect(cache.get('vehicle:1')).resolves.toEqual({ id: 1 });
  });

  it('expira entradas com TTL', async () => {
    jest.useFakeTimers();
    await cache.set('temp', 'value', 1);

    jest.advanceTimersByTime(1100);
    await expect(cache.get('temp')).resolves.toBeNull();

    jest.useRealTimers();
  });

  it('responde ping com true', async () => {
    await expect(cache.ping()).resolves.toBe(true);
  });
});
