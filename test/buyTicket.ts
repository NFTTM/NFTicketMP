import { ethers } from "ethers";
import "dotenv/config";
import * as TokenContract from '../src/assets/contracts/TokenContract.json';

async function main() {
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY);
  console.log(`Using address ${wallet.address}`);
  const provider = new ethers.providers.JsonRpcProvider(process.env.BSC_TESTNET_RPC);
  const signer = wallet.connect(provider);

  const balanceBN = await signer.getBalance();
  const balance = Number(ethers.utils.formatEther(balanceBN));
  console.log(`Wallet balance ${balance}`);

  if (balance < 0.01) {
    throw new Error("Not enough ether");
  }
  console.log("Connecting to Token contract");

  const contractAddress = process.env.TOKEN_CONTRACT_ADDRESS;
  const contractSignedInstance: ethers.Contract = new ethers.Contract(
    contractAddress,
    TokenContract.abi,
    signer,
  );

  const addressHasToken = process.env.ADDRESS_HAS_TOKEN;
  const tokenBalance = await contractSignedInstance.balanceOf(addressHasToken);
  console.log(`Token balance of ${addressHasToken} is ${tokenBalance}`);

  const Message = { name: "alice", id: "A1234", ticketType: "VIP1" };
  const signatureMessage = JSON.stringify(Message);
  const signedHash = await wallet.signMessage(signatureMessage);
  console.log(signedHash);

  // buy a ticket to another address
  const guestWallet = new ethers.Wallet(process.env.PRIVATE_KEY_HAS_TOKEN);
  const guestProvider = new ethers.providers.JsonRpcProvider(process.env.BSC_TESTNET_RPC);
  const guestSigner = guestWallet.connect(guestProvider);
  const nftContract = new ethers.Contract(
    process.env.TOKEN_CONTRACT_ADDRESS,
    TokenContract.abi,
    guestSigner
  );

  // const vip2TicketPrice = ethers.utils.parseEther("0.001");
  // const vip2Name = ethers.utils.formatBytes32String('VIP1');
  // await nftContract.buyTicket(vip2Name, { value: vip2TicketPrice });

  // console.log(`Guest ${guestWallet.address} has bought a VIP1 Ticket`);
  const guestTokenBalance = await contractSignedInstance.balanceOf(guestWallet.address);
  console.log(`Token balance of ${guestWallet.address} is ${guestTokenBalance}`);

  // sign message
  const Message2 = { name: "Charlie", id: "5", ticketType: "VIP1" };
  const signatureMessage2 = JSON.stringify(Message2);
  const signedHash2 = await guestWallet.signMessage(signatureMessage2);
  console.log(signedHash2);

}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});



