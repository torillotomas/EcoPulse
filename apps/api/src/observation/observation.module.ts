import { Module } from "@nestjs/common";
import { Observation } from "./observation.entity";
import { TypeOrmModule } from "@nestjs/typeorm";
//import { ObservationService } from "./observation.service";
//import { ObservationController } from "./observation.controller";

@Module({
    imports: [TypeOrmModule.forFeature([Observation])],
    controllers: [],
    providers: [],
    exports: [],
})
export class ObservationModule { }