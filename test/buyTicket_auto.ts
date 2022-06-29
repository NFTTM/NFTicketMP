import { ethers } from "ethers";
import "dotenv/config";
import * as TokenContract from '../src/assets/contracts/TokenContract.json';

async function main() {
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY_HAS_BNB);
  const provider = new ethers.providers.JsonRpcProvider(process.env.BSC_TESTNET_RPC);
  const signer = wallet.connect(provider);

  const balanceBN = await signer.getBalance();
  const balance = Number(ethers.utils.formatEther(balanceBN));
  console.log(`Wallet balance ${balance}`);

  if (balance < 0.01) {
    throw new Error("Not enough ether");
  }

  const walletBuyer = ethers.Wallet.createRandom();
  console.log(`Created random wallet: Address ${walletBuyer.address}, priKey: ${walletBuyer.privateKey}`);
  const providerBuyer = new ethers.providers.JsonRpcProvider(process.env.BSC_TESTNET_RPC);
  const signerBuyer = wallet.connect(providerBuyer);

  console.log(`Transfer money from ${wallet.address} to ${walletBuyer.address}`);
  const transferValue = ethers.utils.parseEther("0.015");
  let transferTx = {
    to: walletBuyer.address,
    // Convert currency unit from ether to wei
    value: transferValue
  }

  const tx = await signerBuyer.sendTransaction(transferTx);
  console.log('Awaiting transfer confirmed...');
  await tx.wait();
  console.log(`Transfer tx ${tx.hash} confirmed!`);

  const balanceBNBuyer = await signerBuyer.getBalance();
  const balanceBuyer = Number(ethers.utils.formatEther(balanceBNBuyer));
  console.log(`Balance of the buyer wallet is: ${balanceBuyer}`);

  console.log("Connecting to Token contract");

  const contractAddress = process.env.TOKEN_CONTRACT_ADDRESS;
  const contractSignedInstance: ethers.Contract = new ethers.Contract(
    contractAddress,
    TokenContract.abi,
    signerBuyer,
  );

  const vip1TicketPrice = ethers.utils.parseEther("0.001");
  const vip1Name = ethers.utils.formatBytes32String('VIP1');
  const mintTx = await contractSignedInstance.buyTicket(vip1Name, { value: vip1TicketPrice });
  console.log("Awaiting for the buy ticket transaction to be confirmed.")
  await mintTx.wait();

  const addressHasToken = walletBuyer.address;
  const tokenBalance = await contractSignedInstance.balanceOf(addressHasToken);

  console.log(`Token balance of ${addressHasToken} is ${tokenBalance}`);

  const Message = { name: "Xin", id: "X1983", ticketType: "VIP1" };
  const signatureMessage = JSON.stringify(Message);
  const signedHash = await wallet.signMessage(signatureMessage);
  console.log({Message, signedHash});

  const checkedIn = await contractSignedInstance.checkedIn(addressHasToken);
  console.log(`Address ${addressHasToken} checked in: ${checkedIn}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});



