import { Module } from "@nestjs/common";
import { Observation } from "./observation.entity";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ObservationService } from "./observation.service";
import { ObservationController } from "./observation.controller";

@Module({
    imports: [TypeOrmModule.forFeature([Observation])],
    controllers: [ObservationController],
    providers: [ObservationService],
    exports: [ObservationService],
})
export class ObservationModule { }