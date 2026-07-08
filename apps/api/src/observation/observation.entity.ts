import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from '../users/user.entity';

@Entity()
export class Observation {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @ManyToOne(() => User)
    user!: User;

    @Column('text')
    species!: string;

    @Column('text')
    imageUrl!: string;

    @Column({ type: 'geography', spatialFeatureType: 'Point', srid: 4326 })
    location!: string;

    @CreateDateColumn()
    createdAt!: Date;
}
