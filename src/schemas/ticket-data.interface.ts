import { TicketdataDto } from '../dtos/ticket-data.dto';
import { FileDataDto } from '../dtos/file-data.dto';
import { IpfsDataDto } from '../dtos/ipfs-data.dto'

export class TicketData {
  constructor(
    public ticketdata?: TicketdataDto,
    public file?: FileDataDto,
    public ipfs?: IpfsDataDto,
  ) { }
}