import { Module } from '@nestjs/common';
import { Observation } from './observation.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ObservationService } from './observation.service';
import { ObservationController } from './observation.controller';
import { BullModule } from '@nestjs/bullmq';
import { User } from '../users/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Observation, User]),
    BullModule.registerQueue({
      name: 'observation-queue',
    }),
  ],
  controllers: [ObservationController],
  providers: [ObservationService],
  exports: [ObservationService],
})
export class ObservationModule {}
