import { Injectable } from '@nestjs/common';
import { JsonDB } from 'node-json-db';
import { Config } from 'node-json-db/dist/lib/JsonDBConfig';
import { IPFSHTTPClient } from 'ipfs-http-client/types/src/types';
import { create } from 'ipfs-http-client';
import { ethers } from 'ethers';
import { TicketdataDto } from 'src/dtos/ticket-data.dto';
import { TicketData } from 'src/schemas/ticket-data.interface'
import { FileDataDto } from 'src/dtos/file-data.dto';
import { TicketBuyCheckDto } from 'src/dtos/ticket-buy-check.dto';

const DB_PATH = './db/db.json';

@Injectable()
export class TicketService {
  db: JsonDB;
  lastTicketId: number;
  ipfsClient: IPFSHTTPClient;
  contractPublicInstance: ethers.Contract;

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

  storeTicketToJsonDb(ticketId: string, ticketBuyCheckDto: TicketBuyCheckDto) {
    const obj = new TicketData(ticketBuyCheckDto);
    // const ticketId = ++this.lastTicketId;
    this.db.push(`/tickets/${ticketId}/`, obj);
  }

  pushFile(ticketId: string, fileData: FileDataDto) {
    let TicketData: any;
    try {
      TicketData = this.db.getData(`/tickets/${ticketId}/ticketdata/`);
    } catch (error) {
      return { error };
    }
    if (!TicketData) return false;

    this.db.push(`/tickets/${ticketId}/file`, fileData);
    return this.getTicketInfo(ticketId);
  }

  getTickets() {
    return this.db.getData(`/tickets/`);
  }

  getTicketInfo(ticketId: string) {
    return this.db.getData(`/tickets/${ticketId}/ticketdata/`);
  }

  checkSignature(ticketBuyCheckDto: TicketBuyCheckDto) {
    const signatureObject = {name: ticketBuyCheckDto.name, id: ticketBuyCheckDto.id, ticketType: ticketBuyCheckDto.ticketType};
    const signatureMessage = JSON.stringify(signatureObject);
    const signerAddress = ethers.utils.verifyMessage(signatureMessage, ticketBuyCheckDto.signature);
    const signatureValid = signerAddress == ticketBuyCheckDto.address;
    if (signatureValid) {
      this.storeTicketToJsonDb(ticketBuyCheckDto.id, ticketBuyCheckDto);
    }
    return signatureValid;
  }

  async tokenBalanceOf(address: string) {
    const balanceBN = await this.contractPublicInstance.balanceOf(address);
    const balance: number = +ethers.utils.formatEther(balanceBN);
    return balance;
  }

  getAddressById(id: string) {
    const userAddress = this.db.getData(`/tickets/${id}/ticketdata/address`);
    return userAddress;
  }
  async generateTicketImage(name: string, id: string, ticketType: string) {
    // TO-DO: generates an image and return the fileByte;
    let fileBytes;
    return fileBytes;
  }

  async saveImageToIpfs(ticketId: string, fileBytes: BinaryType) {
    // const fileData: FileData = this.get(fileId);
    // const fileLocation = `../upload/${fileData.file.storageName}`;
    // const fileBytes = fs.readFileSync(fileLocation);
    const ipfsData = await this.ipfsClient.add(fileBytes);
    this.db.push(`/tickets/${ticketId}/ipfs`, ipfsData);
    return ipfsData.path;
  }

  async saveJsonToIpfs(ticketId: string, content: string) {
    // const fileData: FileData = this.get(fileId);
    // const fileLocation = `../upload/${fileData.file.storageName}`;
    // const fileBytes = fs.readFileSync(fileLocation);
    const ipfsData = await this.ipfsClient.add(content);
    // this.db.push(`/tickets/${ticketId}/ipfs`, ipfsData);
    return ipfsData.path;
  }

  async getTicket(ticketId: string) {
    const ticketInfo: TicketBuyCheckDto = this.getTicketInfo(ticketId);
    const fileBytes = await this.generateTicketImage(ticketInfo.name, ticketInfo.id, ticketInfo.ticketType);
    const imageURI = await this.saveImageToIpfs(ticketId, fileBytes);
    const jsonObj = {ticketInfo, imageUri: imageURI}
    const ticketJsonURI = await this.saveJsonToIpfs(ticketId, JSON.stringify(jsonObj))
    return ticketJsonURI;
  }
}
