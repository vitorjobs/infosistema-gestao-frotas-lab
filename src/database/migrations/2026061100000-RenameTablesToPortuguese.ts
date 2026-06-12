import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameTablesToPortuguese2026061100000 implements MigrationInterface {
  name = 'RenameTablesToPortuguese2026061100000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await this.renameTableIfNeeded(queryRunner, 'users', 'usuarios');
    await this.renameTableIfNeeded(queryRunner, 'brands', 'marcas');
    await this.renameTableIfNeeded(queryRunner, 'models', 'modelos');
    await this.renameTableIfNeeded(queryRunner, 'vehicles', 'veiculos');
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await this.renameTableIfNeeded(queryRunner, 'veiculos', 'vehicles');
    await this.renameTableIfNeeded(queryRunner, 'modelos', 'models');
    await this.renameTableIfNeeded(queryRunner, 'marcas', 'brands');
    await this.renameTableIfNeeded(queryRunner, 'usuarios', 'users');
  }

  private async renameTableIfNeeded(
    queryRunner: QueryRunner,
    from: string,
    to: string,
  ): Promise<void> {
    const hasSource = await queryRunner.hasTable(from);
    const hasTarget = await queryRunner.hasTable(to);

    if (hasSource && !hasTarget) {
      await queryRunner.query(`EXEC sp_rename '${from}', '${to}'`);
    }
  }
}
