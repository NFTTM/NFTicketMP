import { TicketdataDto } from '../dtos/ticket-data.dto';
import { FileDataDto } from '../dtos/file-data.dto';
import { IpfsDataDto } from '../dtos/ipfs-data.dto'
import { TicketBuyCheckDto } from 'src/dtos/ticket-buy-check.dto';

export class TicketData {
  constructor(
    public ticketdata?: TicketBuyCheckDto,
    public file?: FileDataDto,
    public ipfs?: IpfsDataDto,
  ) { }
}