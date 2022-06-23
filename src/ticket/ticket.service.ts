import { Injectable } from '@nestjs/common';
import { JsonDB } from 'node-json-db';
import { Config } from 'node-json-db/dist/lib/JsonDBConfig';
import { IPFSHTTPClient } from 'ipfs-http-client/types/src/types';
import { create } from 'ipfs-http-client';
import { TicketdataDto } from 'src/dtos/ticket-data.dto';
import { TicketData } from 'src/schemas/ticket-data.interface'
import { FileDataDto } from 'src/dtos/file-data.dto';

const DB_PATH = './db/db.json';

@Injectable()
export class TicketService {
  db: JsonDB;
  lastTicketId: number;
  ipfsClient: IPFSHTTPClient;

  constructor() {
    this.db = new JsonDB(new Config(DB_PATH, true, true, '/'));
    this.ipfsClient = create({
      host: 'localhost',
      port: 5001,
      protocol: 'http',
    });
    const data = this.db.getData('/');
    this.lastTicketId =
      data && Object.keys(data).length > 0
        ? Math.max(...Object.keys(data).map((key) => Number(key)))
        : -1;
  }

  getAll() {
    return this.db.getData('/');
  }

  setTicketData(eventId: number, ticketData: TicketdataDto) {
    const obj = new TicketData(ticketData);
    const ticketId = ++this.lastTicketId;
    this.db.push(`/${eventId}/tickets/`, obj);
    return ticketId;
  }

  pushFile(eventId: number, ticketId: number, fileData: FileDataDto) {
    let TicketData: any;
    try {
      TicketData = this.db.getData(`/${eventId}/tickets/${ticketId}/ticketdata`);
    } catch (error) {
      return { error };
    }
    if (!TicketData) return false;

    this.db.push(`/${eventId}/tickets/${ticketId}/file`, fileData);
    return this.getTicket(eventId, ticketId);
  }

  getTickets(eventId: number) {
    return this.db.getData(`/${eventId}/tickets/`);
  }

  getTicket(eventId: number, ticketId: number) {
    return this.db.getData(`/${eventId}/tickets/${ticketId}/`);
  }
}
