import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import { JsonDB } from 'node-json-db';
import { Config } from 'node-json-db/dist/lib/JsonDBConfig';
import { FileDataDto } from 'src/dtos/file-data.dto';
import { EventdataDto } from 'src/dtos/event-data.dto'
import { create } from 'ipfs-http-client';
import { IPFSHTTPClient } from 'ipfs-http-client/types/src/types';
import { EventData } from 'src/schemas/event-data.interface'

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

  async saveToIpfs() {
    const eventData: EventData = this.getEvent();
    const fileLocation = `./upload/${eventData.file.storageName}`;
    const fileBytes = fs.readFileSync(fileLocation);
    const eventIpfsData = await this.ipfsClient.add(fileBytes);
    this.db.push(`/event/ipfs`, eventIpfsData);
    return eventIpfsData.path;
  }
}
