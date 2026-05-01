// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/governance/Governor.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorCountingSimple.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorVotes.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorVotesQuorumFraction.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract MyGovernance is Governor, GovernorCountingSimple, GovernorVotes, GovernorVotesQuorumFraction, AccessControl {
    constructor(IVotes _token, address defaultAdmin)
        Governor("MyGovernance")
        GovernorVotes(_token)
        GovernorVotesQuorumFraction(51)
    {
        _grantRole(DEFAULT_ADMIN_ROLE, defaultAdmin);
    }

    function votingDelay() public pure override returns (uint256) {
        return 0; // 0 day
    }

    function votingPeriod() public pure override returns (uint256) {
        return 50400; // 1 week
    }

    function proposalThreshold() public pure override returns (uint256) {
        return 0;
    }

    function quorum(uint256 blockNumber)
        public
        view
        override(Governor, GovernorVotesQuorumFraction)
        returns (uint256)
    {
        return super.quorum(blockNumber);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(Governor, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    // Optional: Add this function if you want to allow vote delegation
    function delegate(address delegatee) public {
        IVotes(token()).delegate(delegatee);
    }

    // Optional: Add this function if you want to check voting power
    function getVotingPower(address account) public view returns (uint256) {
        return token().getVotes(account);
    }
}
