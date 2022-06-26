import { ethers } from "ethers";
import "dotenv/config";
import * as TokenContract from '../src/assets/contracts/TokenContract.json';

async function main() {
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY_HAS_TOKEN);
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

  const Message = { address: addressHasToken, requestCheckin: true };
  console.log(Message);
  const signatureMessage = JSON.stringify(Message);
  const signedHash = await wallet.signMessage(signatureMessage);
  console.log(signedHash);

  const addressHasTokenCheckedIn = await contractSignedInstance.checkedIn(addressHasToken);
  console.log(`Address ${addressHasToken} has checked in: ${addressHasTokenCheckedIn}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});