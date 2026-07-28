import { Controller } from '@nestjs/common';
import { Sse } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { RealtimeService } from './realtime.service';

@Controller('realtime')
export class RealtimeController {
  constructor(private readonly realtimeService: RealtimeService) {}

  @Sse('events')
  events(): Observable<MessageEvent> {
    return this.realtimeService.stream.pipe(
      map((payload: any) => ({ data: payload } as MessageEvent)),
    );
  }
}

