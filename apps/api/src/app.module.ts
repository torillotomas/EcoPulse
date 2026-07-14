import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserModule } from './users/user.module';
import { AuthModule } from './auth/auth.module';
import { ObservationModule } from './observation/observation.module';
import { BullModule } from '@nestjs/bullmq';

@Module({
  imports: [
    UserModule,
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: config.get<string>('DATABASE_URL'),
        autoLoadEntities: true,
        synchronize: true,
      }),
    }),
    AuthModule,
    ObservationModule,
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const redisUrl = new URL(config.get<string>('REDIS_URL')!);

        return {
          connection: {
            host: redisUrl.hostname,
            port: Number(redisUrl.port),
            password: redisUrl.password,
            tls: {},
          },
        };
      },
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
