import { contractFile } from './compile.js';
import { ethers } from 'ethers';
import dotenv from 'dotenv';

dotenv.config();

const contractBytecode = contractFile.evm.bytecode.object;
const contractAbi = contractFile.abi;

const api = process.env.API;
const privateKey = process.env.PRIVATE_KEY;

const provider = new ethers.JsonRpcProvider(api);
provider.pollingInterval = 1000; // Add this line
const wallet = new ethers.Wallet(privateKey, provider);

// Define the constructor arguments
const _token = "0x315F6013042e2c11056AaF3a15f2D5a8740C5289"; // Replace with the actual token address
const defaultAdmin = wallet.address; // or any other address you want to set as the default admin

console.log('w', wallet.address);
async function deployContract() {
  try {
    // Create a contract factory
    const factory = new ethers.ContractFactory(contractAbi, contractBytecode, wallet);

    console.log(`Attempting to deploy from account: ${wallet.address}`);
    // Pass the constructor arguments when deploying the contract
    const contract = await factory.deploy(_token, defaultAdmin);
    const res = await contract.waitForDeployment();
    console.log(res);
    
    const txReceipt = await contract.deploymentTransaction().wait();
    console.log(`Contract deployed at address: ${txReceipt.contractAddress}`);
    console.log(`Contract transaction hash: ${txReceipt.hash}`);
  } catch (error) {
    console.error('Error deploying contract:', error);
  }
}

deployContract();
