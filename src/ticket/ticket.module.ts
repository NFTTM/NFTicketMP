import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { TicketController } from './ticket.controller';
import { TicketService } from './ticket.service';
import { SharedModule } from 'src/shared/shared.module'

@Module({
  imports: [
    MulterModule.register({
      dest: './upload',
    }),
    SharedModule
  ],
  controllers: [TicketController],
  providers: [TicketService]
})
export class TicketModule { }
