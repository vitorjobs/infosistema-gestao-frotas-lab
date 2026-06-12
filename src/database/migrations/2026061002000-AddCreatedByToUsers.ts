import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddCreatedByToUsers2026061002000 implements MigrationInterface {
  name = 'AddCreatedByToUsers2026061002000';

  async up(queryRunner: QueryRunner): Promise<void> {
    const usersTable = await queryRunner.getTable('usuarios');
    const hasCreatedBy = usersTable?.columns.some((column) => column.name === 'created_by');

    if (!hasCreatedBy) {
      await queryRunner.addColumn(
        'usuarios',
        new TableColumn({
          name: 'created_by',
          type: 'varchar',
          length: '120',
          isNullable: false,
          default: "'system'",
        }),
      );
    }
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    const usersTable = await queryRunner.getTable('usuarios');
    const hasCreatedBy = usersTable?.columns.some((column) => column.name === 'created_by');

    if (hasCreatedBy) {
      await queryRunner.dropColumn('usuarios', 'created_by');
    }
  }
}
