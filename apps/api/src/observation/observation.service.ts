import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Observation } from './observation.entity';
import { User } from '../users/user.entity';
import { Repository } from 'typeorm';
import { CreateObservationDto } from './dto/create-observation.dto';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';


@Injectable()
export class ObservationService {
  constructor(
    @InjectRepository(Observation) private repo: Repository<Observation>,
    @InjectQueue('observation-queue') private queue: Queue
  ) {}

  async create(
    dto: CreateObservationDto,
    userId: string,
  ): Promise<Observation> {
    const result = await this.repo
      .createQueryBuilder()
      .insert()
      .into(Observation)
      .values({
        imageUrl: dto.imageUrl,
        user: { id: userId },
        location: () => `ST_SetSRID(ST_MakePoint(:longitude, :latitude), 4326)`,
      })
      .setParameters({ longitude: dto.longitude, latitude: dto.latitude })
      .returning('*')
      .execute();

    const { userId: discarded, ...raw } = result.raw[0] as any;

    const row = {
      ...raw,
      user: { id: userId } as User,
    } as Observation;

    await this.queue.add('process-observation', {
      observationId: row.id,
    });

    return row;
  }

  async findAll(): Promise<ObservationSummary[]> {
    return this.repo
      .createQueryBuilder('observation')
      .leftJoin('observation.user', 'user')
      .select([
        'observation.id AS id',
        'observation.species AS species',
        'observation.imageUrl AS "imageUrl"',
        'ST_AsGeoJSON(observation.location) AS location',
        'observation.createdAt AS "createdAt"',
        'user.name AS username',
        'observation.status AS status',
      ])
      .getRawMany<ObservationSummary>();
  }
}

export interface ObservationSummary {
  id: string;
  species: string | null;
  imageUrl: string;
  location: string;
  createdAt: Date;
  username: string;
  status: 'pending' | 'processed' | 'failed';
}
