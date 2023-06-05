// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @param deposit the entity's deposit
 * @param staked true if this entity is staked.
 * @param stake actual amount of ether staked for this entity.
 * @param unstakeDelaySec minimum delay to withdraw the stake.
 * @param withdrawTime - first block timestamp where 'withdrawStake' will be callable, or zero if already locked
 * @dev sizes were chosen so that (deposit,staked, stake) fit into one cell (used during handleOps)
 *    and the rest fit into a 2nd cell.
 *    112 bit allows for 10^15 eth
 *    48 bit for full timestamp
 *    32 bit allows 150 years for unstake delay
 */
struct DepositInfo {
    uint112 deposit;
    bool staked;
    uint112 stake;
    uint32 unstakeDelaySec;
    uint48 withdrawTime;
}

//API struct used by getStakeInfo and simulateValidation
struct StakeInfo {
    uint256 stake;
    uint256 unstakeDelaySec;
}
