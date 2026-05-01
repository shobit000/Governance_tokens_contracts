import { ethers } from 'ethers';
import dotenv from 'dotenv';

dotenv.config();


const api = process.env.API;
const privateKey = process.env.PRIVATE_KEY
const provider = new ethers.JsonRpcProvider(api);

const wallet = new ethers.Wallet(privateKey, provider)

// Ethereum address for which you want to fetch the balance
const account1 = '0x70F480b7EbC27e8CE127B910Ce89035B8fE50EB5';
// const account2 = '0x92BbF26da81b22A7c01ae46A87099D0942212bFb'

async function fetchAccountBalance() {
  try {
    // Fetch the balance for the specified address
    const balance1 = await provider.getBalance(account1);
    // const balance2 = await provider.getBalance(account2);

    // Convert the balance from wei to ether (or other units if needed)
    const balanceInEther1 = ethers.formatEther(balance1);
    // const balanceInEther2 = ethers.formatEther(balance2);

    console.log(`Balance for ${account1}: ${balanceInEther1} ETH`);
    // console.log(`Balance for ${account2}: ${balanceInEther2} ETH`);

    // const trans = wallet.sendTransaction({ to: account2, value: ethers.parseEther('0.00000000000000001') });
    // const receipt = (await trans).wait;
    console.log(`Balance for ${account1}: ${balanceInEther1} ETH`);
    // console.log(`Balance for ${account2}: ${balanceInEther2} ETH`);
    // console.log(receipt);
  } catch (error) {
    console.error('Error fetching balance:', error);
  }
}

// Call the function to fetch the balance
fetchAccountBalance();
