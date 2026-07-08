import { Controller, Post, Body, UseGuards, Req } from "@nestjs/common";
import { ObservationService } from "./observation.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CreateObservationDto } from "./dto/create-observation.dto";

@Controller("observations")
@UseGuards(JwtAuthGuard)
export class ObservationController {
  constructor(private readonly observationService: ObservationService) {}

  @Post()
  create(@Body() dto: CreateObservationDto, @Req() req: any) {
    const userId: string = req.user?.userId;
    return this.observationService.create(dto, userId);
  }
}

