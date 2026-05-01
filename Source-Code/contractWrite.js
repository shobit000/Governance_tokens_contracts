import { ethers } from 'ethers';
import dotenv from 'dotenv';
import { contractFile } from './compile.js';

const contractAbi = contractFile.abi;

dotenv.config();

const privateKey = process.env.PRIVATE_KEY;
const api = process.env.API;

const contractAddress = '0x84FBcb631232FDD3943101457E8E981125AB1DE5';

// Ethereum provider
const provider = new ethers.JsonRpcProvider(api);
provider.pollingInterval = 1000; // Adjust polling interval
const wallet = new ethers.Wallet(privateKey, provider);

async function proposeNewValue() {
  try {
    console.log('Connecting to contract at address:', contractAddress);
    const MyToken = new ethers.Contract(contractAddress, contractAbi, wallet);
    console.log('Contract instance created');

    // Example proposal data
    const targets = [contractAddress];
    const values = [0]; // No ETH being sent
    const functionSignature = "updateQuorumNumerator(uint256)";
    const newQuorumNumerator = 56; // Example: change quorum to 57%
    const calldata = ethers.AbiCoder.defaultAbiCoder().encode(["uint256"], [newQuorumNumerator]);
    const description = "Change quorum to 57%";

    console.log('Proposal details:');
    console.log('Targets:', targets);
    console.log('Values:', values);
    console.log('Function signature:', functionSignature);
    console.log('Calldata:', calldata);
    console.log('Description:', description);

    console.log(`Attempting to create a proposal from account: ${wallet.address}`);

    const tx = await MyToken.propose(targets, values, [calldata], description, { gasLimit: 1000000 });
    console.log('Transaction sent. Hash:', tx.hash);
    console.log('Waiting for transaction to be mined...');

    const receipt = await tx.wait(2); // Wait for 2 confirmations
    console.log('Transaction mined. Receipt:', receipt);

    const proposalCreatedEvent = receipt.logs.find(
      log => log.fragment && log.fragment.name === 'ProposalCreated'
    );

    if (proposalCreatedEvent) {
      const proposalId = proposalCreatedEvent.args[0];
      console.log('Proposal created with ID:', proposalId.toString());
      return proposalId.toString();
    } else {
      console.log('ProposalCreated event not found in the logs');
      console.log('All events:', receipt.logs);
      return null;
    }

  } catch (error) {
    console.error('Error creating proposal:', error);
    if (error.reason) console.error('Error reason:', error.reason);
    if (error.data) console.error('Error data:', error.data);
    return null;
  }
}

async function getProposalState(proposalId) {
  try {
    const MyToken = new ethers.Contract(contractAddress, contractAbi, wallet);
    
    console.log(`Attempting to get state for proposal: ${proposalId}`);

    const state = await MyToken.state(proposalId);
    
    const stateMap = [
      "Pending",
      "Active",
      "Canceled",
      "Defeated",
      "Succeeded",
      "Queued",
      "Expired",
      "Executed"
    ];

    console.log(`Proposal state: ${stateMap[state]} (${state})`);
    return state;
  } catch (error) {
    console.error('Error getting proposal state:', error);
  }
}

async function castVote(proposalId, support) {
  try {
    const MyToken = new ethers.Contract(contractAddress, contractAbi, wallet);
    
    console.log(`Attempting to cast vote on proposal ${proposalId}`);
    console.log(`Vote: ${support ? 'For' : 'Against'}`);

    const tx = await MyToken.castVote(proposalId, support ? 1 : 0, { gasLimit: 300000 });
    console.log('Transaction sent. Hash:', tx.hash);
    console.log('Waiting for transaction to be mined...');

    const receipt = await tx.wait(2); // Wait for 2 confirmations
    console.log('Vote cast successfully. Receipt:', receipt);

    const voteEvent = receipt.logs.find(
      log => log.fragment && log.fragment.name === 'VoteCast'
    );

    if (voteEvent) {
      const voter = voteEvent.args.voter;
      const weight = voteEvent.args.weight;
      console.log(`Vote cast by ${voter} with weight ${weight.toString()}`);
    } else {
      console.log('VoteCast event not found in the logs');
    }

    return true;
  } catch (error) {
    console.error('Error casting vote:', error);
    if (error.reason) console.error('Error reason:', error.reason);
    if (error.data) console.error('Error data:', error.data);
    return false;
  }
}

// Modify the main function to include voting
async function main() {
  try {
    const proposalId = await proposeNewValue();
    
    if (proposalId) {
      console.log('Waiting for 30 seconds before checking proposal state...');
      await new Promise(resolve => setTimeout(resolve, 30000));
      
      await getProposalState(proposalId);

      // Cast a vote (true for 'For', false for 'Against')
      console.log('Casting a vote...');
      const voteSuccess = await castVote(proposalId, true);
      
      if (voteSuccess) {
        console.log('Vote cast successfully');
        // Check the proposal state again after voting
        await getProposalState(proposalId);
      } else {
        console.log('Failed to cast vote');
      }
    } else {
      console.log('No proposal ID was returned. Unable to proceed with voting.');
    }
  } catch (error) {
    console.error('Error in main function:', error);
  }
}

main();
