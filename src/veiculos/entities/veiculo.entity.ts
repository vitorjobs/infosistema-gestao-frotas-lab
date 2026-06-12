import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { FleetModel } from '../../modelos/entities/modelo.entity';

@Entity('veiculos')
export class Vehicle {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column({ name: 'license_plate', type: 'varchar', length: 10, unique: true })
  license_plate!: string;

  @Column({ type: 'varchar', length: 30, unique: true })
  chassis!: string;

  @Column({ type: 'varchar', length: 20, unique: true })
  renavam!: string;

  @Column({ type: 'int' })
  year!: number;

  @Column({ name: 'model_id', type: 'int' })
  model_id!: number;

  @ManyToOne(() => FleetModel, (model) => model.vehicles, {
    eager: true,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'model_id' })
  model!: FleetModel;

  @Column({ type: 'varchar', length: 120 })
  created_by!: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at!: Date;
}
