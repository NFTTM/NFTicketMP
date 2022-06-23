import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EventModule } from './event/event.module';
import { TicketModule } from './ticket/ticket.module';

@Module({
  imports: [
    EventModule,
    TicketModule,
  ],
  // controllers: [AppController],
  // providers: [AppService],
})
export class AppModule {}
