import { Injectable } from '@nestjs/common';
import { JsonDB } from 'node-json-db';
import { Config } from 'node-json-db/dist/lib/JsonDBConfig';
import { IPFSHTTPClient } from 'ipfs-http-client/types/src/types';
import { create } from 'ipfs-http-client';
import { ethers } from 'ethers';
import { TicketData } from 'src/schemas/ticket-data.interface'
import { FileDataDto } from 'src/dtos/file-data.dto';
import { TicketBuyCheckDto } from 'src/dtos/ticket-buy-check.dto';
import { ProviderService } from 'src/shared/services/provider/provider.service';
import { SignerService } from 'src/shared/services/signer/signer.service';
import * as watermark from 'jimp-watermark';
import * as fs from 'fs';
import * as TokenContract from 'src/assets/contracts/TokenContract.json';
import { TicketCheckinDto } from 'src/dtos/ticket-checkin.dto';

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

  async setupContractInstances() {
    const contractAddress = process.env.TOKEN_CONTRACT_ADDRESS;
    if (!contractAddress || contractAddress.length === 0) return;

    const balanceBN = await this.signerService.signer.getBalance();
    const balance = Number(ethers.utils.formatEther(balanceBN));

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

  verifyBuySignature(ticketBuyCheckDto: TicketBuyCheckDto) {
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
    const balanceBN = await this.contractSignedInstance.balanceOf(address);
    const balance: number = +ethers.utils.formatEther(balanceBN);
    return balance;
  }

  getAddressById(id: string) {
    let userAddress;
    try {
      userAddress = this.db.getData(`/tickets/${id}/ticketdata/address`);
    } catch (error) {
      return false;
    }
    return userAddress;
  }
  async generateTicketImage(name: string, id: string, ticketType: string) {
    let storageName;
    try {
      storageName = this.db.getData('/event/file/storageName/')
    } catch (error) {
      throw error;
    }
    var options = {
      'text': `${name} ${id} ${ticketType}`,
      'textSize': 6, //Should be between 1-8
      'dstPath': WATER_MARK_IMAGE
    };
    watermark.addTextWatermark(`./upload/${storageName}`, options);
    return true;
  }

  async getTicket(ticketId: string) {
    const ticketInfo: TicketBuyCheckDto = this.getTicketInfo(ticketId);
    const fileBytes = fs.readFileSync(WATER_MARK_IMAGE);
    const ticketImageIpfsData = await this.ipfsClient.add(fileBytes);
    this.db.push(`/tickets/${ticketId}/imageIpfs`, ticketImageIpfsData);
    const ticketJsonObj = {
      name: ticketInfo.name,
      id: ticketInfo.id,
      ticketType: ticketInfo.ticketType,
      signedHash: ticketInfo.signature,
      imageUri: ticketImageIpfsData.path
    };
    const ticketJsonticketImageIpfsData = await this.ipfsClient.add(JSON.stringify(ticketJsonObj))
    const ticketJsonURI = ticketJsonticketImageIpfsData.path;
    this.db.push(`/tickets/${ticketId}/jsonIpfs`, ticketJsonticketImageIpfsData);
    return ticketJsonURI;
  }

  async verifyCheckinSignature(ticketCheckinDto: TicketCheckinDto) {
    const signatureObject = {
      address: ticketCheckinDto.address,
      requestCheckin: ticketCheckinDto.requestCheckin,
    };
    const signatureMessage = JSON.stringify(signatureObject);
    const signerAddress = ethers.utils.verifyMessage(signatureMessage, ticketCheckinDto.signedHashForCheckin);
    const signatureValid = signerAddress == ticketCheckinDto.address;
    return signatureValid;
  }
  async checkin(ticketCheckinDto: TicketCheckinDto) {
    // This function didn't know which ticket to checkin if an address holds multiple tickets.
    // Now backend didn't check if this addres holds a ticket or ticket expired.
    const attendeeAddress = ticketCheckinDto.address;
    const attendeeCheckedIn = await this.contractSignedInstance.checkedIn(attendeeAddress);
    if (attendeeCheckedIn) {
      return false;
    }
    await this.contractSignedInstance.checkAttendeeIn(attendeeAddress);
    return true;
  }
}
