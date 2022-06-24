import { Injectable, StreamableFile } from '@nestjs/common';
import * as fs from 'fs';
import { JsonDB } from 'node-json-db';
import { Config } from 'node-json-db/dist/lib/JsonDBConfig';
import { FileDataDto } from 'src/dtos/file-data.dto';
import { MetadataDto } from 'src/dtos/metadata.dto';
import { EventdataDto } from 'src/dtos/event-data.dto'
import { FileData } from 'src/schemas/file-data.interface';
import { create } from 'ipfs-http-client';
import { createReadStream } from 'fs';
import { IPFSHTTPClient } from 'ipfs-http-client/types/src/types';
import { concat as uint8ArrayConcat } from 'uint8arrays/concat';
import { EventData } from 'src/schemas/event-data.interface'
import fetch from 'node-fetch';

const DB_PATH = './db/db.json';

@Injectable()
export class EventService {
  db: JsonDB;
  lastEventId: number;
  ipfsClient: IPFSHTTPClient;

  constructor() {
    this.db = new JsonDB(new Config(DB_PATH, true, true, '/'));
    this.ipfsClient = create({
      host: 'localhost',
      port: 5001,
      protocol: 'http',
    });
    const data = this.db.getData('/');
    this.lastEventId =
      data.event && Object.keys(data.event).length > 0
        ? Math.max(...Object.keys(data.event).map((key) => Number(key)))
        : -1;
  }

  getAll() {
    return this.db.getData('/');
  }

  setEventData(eventData: EventdataDto) {
    if (this.lastEventId == -1) {
      const obj = new EventData(eventData);
      const eventId = ++this.lastEventId;
      this.db.push(`/event/`, obj);
      return eventId;
    }
    return false;
  }

  pushFile(fileData: FileDataDto) {
    let eventData: any;
    try {
      eventData = this.db.getData(`/event/eventdata`);
    } catch (error) {
      return { error };
    }
    if (!eventData) return false;

    this.db.push(`/event/file`, fileData);
    return this.getEvent();
  }

  getEvent() {
    return this.db.getData(`/event/`);
  }
}
