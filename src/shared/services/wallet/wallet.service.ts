import { Injectable } from '@nestjs/common';
import { ethers } from 'ethers';

@Injectable()
export class WalletService {
  wallet: ethers.Wallet;

  constructor() {
    this.setupWallet();
  }

  setupWallet() {
    const priKey = process.env.PRIVATE_KEY;
    if (!priKey || priKey.length === 0) return;
    this.wallet = new ethers.Wallet(priKey);
  }

  walletAddress() {
    return this.wallet.address;
  }
}
