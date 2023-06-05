// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * gas and return values during simulation
 * @param preOpGas the gas used for validation (including preValidationGas)
 * @param prefund the required prefund for this operation
 * @param sigFailed validateUserOp's (or paymaster's) signature check failed
 * @param validAfter - first timestamp this UserOp is valid (merging account and paymaster time-range)
 * @param validUntil - last timestamp this UserOp is valid (merging account and paymaster time-range)
 * @param paymasterContext returned by validatePaymasterUserOp (to be passed into postOp)
 */
struct ReturnInfo {
    uint256 preOpGas;
    uint256 prefund;
    bool sigFailed;
    uint48 validAfter;
    uint48 validUntil;
    bytes paymasterContext;
}
