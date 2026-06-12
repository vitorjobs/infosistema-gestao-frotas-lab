import * as bcrypt from 'bcryptjs';
import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableColumn,
  TableForeignKey,
} from 'typeorm';

export class CreateUsersAndBrands2026061001000 implements MigrationInterface {
  name = 'CreateUsersAndBrands2026061001000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'usuarios',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'nickname',
            type: 'varchar',
            length: '80',
            isNullable: false,
            isUnique: true,
          },
          {
            name: 'name',
            type: 'varchar',
            length: '160',
            isNullable: false,
          },
          {
            name: 'email',
            type: 'varchar',
            length: '180',
            isNullable: false,
            isUnique: true,
          },
          {
            name: 'password_hash',
            type: 'varchar',
            length: '120',
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'datetime2',
            default: 'GETUTCDATE()',
          },
          {
            name: 'updated_at',
            type: 'datetime2',
            default: 'GETUTCDATE()',
          },
        ],
      }),
      true,
    );

    const passwordHash = await bcrypt.hash(process.env.DEFAULT_USER_PASSWORD || 'aivacol', 10);
    await queryRunner.query(
      `INSERT INTO usuarios (nickname, name, email, password_hash)
       VALUES (@0, @1, @2, @3)`,
      ['aivacol', 'Aivacol Admin', 'aivacol@example.com', passwordHash],
    );

    await queryRunner.createTable(
      new Table({
        name: 'marcas',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'name',
            type: 'varchar',
            length: '120',
            isNullable: false,
            isUnique: true,
          },
          {
            name: 'created_at',
            type: 'datetime2',
            default: 'GETUTCDATE()',
          },
          {
            name: 'updated_at',
            type: 'datetime2',
            default: 'GETUTCDATE()',
          },
          {
            name: 'created_by',
            type: 'varchar',
            length: '120',
            isNullable: false,
            default: "'aivacol'",
          },
        ],
      }),
      true,
    );

    await queryRunner.addColumn(
      'modelos',
      new TableColumn({
        name: 'brand_id',
        type: 'int',
        isNullable: true,
      }),
    );

    await queryRunner.createForeignKey(
      'modelos',
      new TableForeignKey({
        name: 'FK_modelos_marcas_brand_id',
        columnNames: ['brand_id'],
        referencedTableName: 'marcas',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      }),
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    const modelsTable = await queryRunner.getTable('modelos');
    const brandForeignKey = modelsTable?.foreignKeys.find((foreignKey) =>
      foreignKey.columnNames.includes('brand_id'),
    );

    if (brandForeignKey) {
      await queryRunner.dropForeignKey('modelos', brandForeignKey);
    }

    const hasBrandId = modelsTable?.columns.some((column) => column.name === 'brand_id');
    if (hasBrandId) {
      await queryRunner.dropColumn('modelos', 'brand_id');
    }

    await queryRunner.dropTable('marcas', true);
    await queryRunner.dropTable('usuarios', true);
  }
}
