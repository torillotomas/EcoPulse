import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { User } from '../users/user.entity';

enum ObservationStatus {
  PENDING = 'pending',
  PROCESSED = 'processed',
  FAILED = 'failed',
}

@Entity()
export class Observation {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User)
  user!: User;

  @Column({ type: 'text', nullable: true })
  commonName!: string | null;

  @Column({ type: 'text', nullable: true })
  scientificName!: string | null;

  @Column({ type: 'text', nullable: true })
  group!: string | null;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column('text')
  imageUrl!: string;

  @Column({ type: 'geography', spatialFeatureType: 'Point', srid: 4326 })
  location!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @Column({ type: 'float', nullable: true })
  confidenceScore!: number | null;

  @Column({
    type: 'enum',
    enum: ObservationStatus,
    default: ObservationStatus.PENDING,
  })
  status!: ObservationStatus;
}
