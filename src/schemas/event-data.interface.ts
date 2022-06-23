import { EventdataDto } from '../dtos/event-data.dto';
import { FileDataDto } from '../dtos/file-data.dto';
import { IpfsDataDto } from '../dtos/ipfs-data.dto'

export class EventData {
  constructor(
    public eventdata?: EventdataDto,
    public file?: FileDataDto,
    public ipfs?: IpfsDataDto,
  ) { }
}
