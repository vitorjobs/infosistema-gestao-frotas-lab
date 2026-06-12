import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Brand } from '../../marcas/entities/marca.entity';
import { Vehicle } from '../../veiculos/entities/veiculo.entity';

@Entity('modelos')
export class FleetModel {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column({ type: 'varchar', length: 120, unique: true })
  name!: string;

  @Column({ name: 'brand_id', type: 'int', nullable: true })
  brand_id?: number | null;

  @ManyToOne(() => Brand, (brand) => brand.models, {
    eager: true,
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'brand_id' })
  brand?: Brand | null;

  @Column({ type: 'varchar', length: 120 })
  created_by!: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at!: Date;

  @OneToMany(() => Vehicle, (vehicle) => vehicle.model)
  vehicles?: Vehicle[];
}
