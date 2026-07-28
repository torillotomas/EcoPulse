import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Observable, Subject } from 'rxjs';
import Redis, { RedisOptions } from 'ioredis';

@Injectable()
export class RealtimeService implements OnModuleInit, OnModuleDestroy {
  private readonly subject = new Subject<any>();
  private redisClient: Redis | null = null;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    const redisUrl = this.configService.get<string>('REDIS_URL');

    if (!redisUrl) {
      throw new Error('REDIS_URL is not configured');
    }

    const redisConfig = this.buildRedisConfig(redisUrl);
    this.redisClient = new Redis(redisConfig);

    const redisClient = this.redisClient;
    await redisClient.subscribe('observation-updates');
    redisClient.on('message', (channel, message) => {
      if (channel === 'observation-updates') {
        this.emit({
          event: 'realtime:observation-update',
          payload: message,
          receivedAt: new Date().toISOString(),
        });
      }
    });

    this.emit({ event: 'realtime:ready', timestamp: new Date().toISOString() });
  }

  async onModuleDestroy() {
    this.subject.complete();
    if (this.redisClient) {
      await this.redisClient.quit();
    }
  }

  private buildRedisConfig(redisUrl: string): RedisOptions {
    const parsedUrl = new URL(redisUrl);

    const redisConfig: RedisOptions = {
      host: parsedUrl.hostname,
      port: Number(parsedUrl.port || 6379),
      username: parsedUrl.username || undefined,
      password: parsedUrl.password || undefined,
    };

    if (parsedUrl.protocol === 'rediss:') {
      redisConfig.tls = {};
    }

    return redisConfig;
  }

  get stream(): Observable<any> {
    return this.subject.asObservable();
  }

  emit(payload: any) {
    this.subject.next(payload);
  }
}
