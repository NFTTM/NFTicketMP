import { IpfsDataDto } from '../dtos/ipfs-data.dto'
import { TicketCheckDto } from 'src/dtos/ticket-data.dto';

export class TicketData {
  constructor(
    public ticketdata?: TicketCheckDto,
    public ticketIpfs?: IpfsDataDto,
  ) { }
}