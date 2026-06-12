import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class CreateModelsAndVehicles2026061000000 implements MigrationInterface {
  name = 'CreateModelsAndVehicles2026061000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'modelos',
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

    await queryRunner.createTable(
      new Table({
        name: 'veiculos',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'license_plate',
            type: 'varchar',
            length: '10',
            isNullable: false,
            isUnique: true,
          },
          {
            name: 'chassis',
            type: 'varchar',
            length: '30',
            isNullable: false,
            isUnique: true,
          },
          {
            name: 'renavam',
            type: 'varchar',
            length: '20',
            isNullable: false,
            isUnique: true,
          },
          {
            name: 'year',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'model_id',
            type: 'int',
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

    await queryRunner.createForeignKey(
      'veiculos',
      new TableForeignKey({
        name: 'FK_veiculos_modelos_model_id',
        columnNames: ['model_id'],
        referencedTableName: 'modelos',
        referencedColumnNames: ['id'],
        onDelete: 'NO ACTION',
        onUpdate: 'CASCADE',
      }),
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    const vehiclesTable = await queryRunner.getTable('veiculos');
    const modelForeignKey = vehiclesTable?.foreignKeys.find((foreignKey) =>
      foreignKey.columnNames.includes('model_id'),
    );

    if (modelForeignKey) {
      await queryRunner.dropForeignKey('veiculos', modelForeignKey);
    }

    await queryRunner.dropTable('veiculos', true);
    await queryRunner.dropTable('modelos', true);
  }
}
