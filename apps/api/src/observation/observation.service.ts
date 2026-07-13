import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Observation } from "./observation.entity";
import { User } from "../users/user.entity";
import { Repository } from "typeorm";
import { CreateObservationDto } from "./dto/create-observation.dto";

@Injectable()
export class ObservationService {
    constructor(
        @InjectRepository(Observation) private repo: Repository<Observation>
    ) { }

    async create(dto: CreateObservationDto, userId: string): Promise<Observation> {
        const result = await this.repo.createQueryBuilder()
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

        const { userId: discarded, ...row } = result.raw[0] as any;

        return {
            ...row,
            user: { id: userId } as User,
        } as Observation;
    }

    async findAll(): Promise<ObservationSummary[]> {
        return this.repo.createQueryBuilder('observation')
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

