import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { EventController } from './event.controller';
import { EventService } from './event.service';

@Module({
  imports: [
    MulterModule.register({
      dest: './upload',
    }),
  ],
  controllers: [EventController],
  providers: [EventService]
})
export class EventModule {}