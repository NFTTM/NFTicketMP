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
import { ProviderService } from 'src/shared/services/provider/provider.service';
import { SignerService } from 'src/shared/services/signer/signer.service';
import * as watermark from 'jimp-watermark';
import * as fs from 'fs';
import * as TokenContract from 'src/assets/contracts/Token.json';

const DB_PATH = './db/db.json';
const WATER_MARK_IMAGE = './upload/watermark.png';

@Injectable()
export class TicketService {
  db: JsonDB;
  ipfsClient: IPFSHTTPClient;
  contractPublicInstance: ethers.Contract;
  contractSignedInstance: ethers.Contract;

  constructor(
    private providerService: ProviderService,
    private signerService: SignerService,
  ) {
    this.db = new JsonDB(new Config(DB_PATH, true, true, '/'));
    this.ipfsClient = create({
      host: 'localhost',
      port: 5001,
      protocol: 'http',
    });

    this.setupContractInstances();
  }

  setupContractInstances() {
    const contractAddress = process.env.TOKEN_CONTRACT_ADDRESS;
    if (!contractAddress || contractAddress.length === 0) return;
    this.contractPublicInstance = new ethers.Contract(
      contractAddress,
      TokenContract.abi,
      this.providerService.provider,
    );
    this.contractSignedInstance = new ethers.Contract(
      contractAddress,
      TokenContract.abi,
      this.signerService.signer,
    );
  }

  getAll() {
    return this.db.getData('/');
  }

  storeTicketToJsonDb(ticketId: string, ticketBuyCheckDto: TicketBuyCheckDto) {
    const obj = new TicketData(ticketBuyCheckDto);
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
    const signatureObject = { name: ticketBuyCheckDto.name, id: ticketBuyCheckDto.id, ticketType: ticketBuyCheckDto.ticketType };
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
    var options = {
      'text': `${name} ${id} ${ticketType}`,
      'textSize': 6, //Should be between 1-8
      'dstPath': WATER_MARK_IMAGE
    };

    const storageName = this.db.getData('/event/file/storageName/')
    watermark.addTextWatermark(`./upload/${storageName}`, options);
  }

  async getTicket(ticketId: string) {
    const ticketInfo: TicketBuyCheckDto = this.getTicketInfo(ticketId);
    await this.generateTicketImage(ticketInfo.name, ticketInfo.id, ticketInfo.ticketType);
    const fileBytes = fs.readFileSync(WATER_MARK_IMAGE);
    const ticketImageIpfsData = await this.ipfsClient.add(fileBytes);
    this.db.push(`/tickets/${ticketId}/ipfs`, ticketImageIpfsData);
    console.log(ticketImageIpfsData);
    const ticketJsonObj = {
      name: ticketInfo.name,
      id: ticketInfo.id,
      ticketType: ticketInfo.ticketType,
      signedHash: ticketInfo.signature,
      imageUri: ticketImageIpfsData.path
    };
    console.log(ticketJsonObj);
    const ticketJsonticketImageIpfsData = await this.ipfsClient.add(JSON.stringify(ticketJsonObj))
    const ticketJsonURI = ticketJsonticketImageIpfsData.path;
    return ticketJsonURI;
  }
}
