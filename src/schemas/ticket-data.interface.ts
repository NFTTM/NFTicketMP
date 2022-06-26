import { IpfsDataDto } from '../dtos/ipfs-data.dto'
import { TicketBuyCheckDto } from 'src/dtos/ticket-buy-check.dto';

export class TicketData {
  constructor(
    public ticketdata?: TicketBuyCheckDto,
    public imageIpfs?: IpfsDataDto,
    public jsonIpfs?: IpfsDataDto,
  ) { }
}