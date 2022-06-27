import { Global, Module } from '@nestjs/common';
import { ProviderService } from './services/provider/provider.service';
import { WalletService } from './services/wallet/wallet.service';
import { SignerService } from './services/signer/signer.service';
import { IpfsService } from './services/ipfs/ipfs.service';

@Global()
@Module({
  providers: [ProviderService, WalletService, SignerService, IpfsService],
  exports: [ProviderService, WalletService, SignerService, IpfsService],
})
export class SharedModule { }
