import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { TicketController } from './ticket.controller';
import { TicketService } from './ticket.service';

@Module({
  imports: [
    MulterModule.register({
      dest: './upload',
    }),
  ],
  controllers: [TicketController],
  providers: [TicketService]
})
export class TicketModule {}
