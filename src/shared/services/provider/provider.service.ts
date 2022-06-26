import { Injectable } from '@nestjs/common';
import { ethers } from 'ethers';

@Injectable()
export class ProviderService {
  provider: ethers.providers.BaseProvider;
  constructor() {
    this.setupProvider();
  }

  setupProvider() {
    const provider = new ethers.providers.JsonRpcProvider(process.env.BSC_TESTNET_RPC);
    this.provider = provider;
  }

  async getBalance(address: string) {
    const balanceBN = await this.provider.getBalance(address);
    const balance = ethers.utils.formatEther(balanceBN);
    return balance;
  }

  async getBlockData(blockHashOrTag: string = 'latest') {
    const block = await this.provider.getBlock(blockHashOrTag);
    return block;
  }
}
