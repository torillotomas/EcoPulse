import { Controller, Post, Body, UseGuards, Req, Get } from '@nestjs/common';
import { ObservationService } from './observation.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateObservationDto } from './dto/create-observation.dto';
import { ObservationSummary } from './observation.service';

@Controller('observations')
export class ObservationController {
  constructor(private readonly observationService: ObservationService) {}

  @Get()
  findAll(): Promise<ObservationSummary[]> {
    return this.observationService.findAll();
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() dto: CreateObservationDto, @Req() req: any) {
    const userId: string = req.user?.userId;
    return this.observationService.create(dto, userId);
  }
}
