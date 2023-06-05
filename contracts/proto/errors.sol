// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./structs.sol";

/**
 * a custom revert error of handleOps, to identify the offending op.
 *  NOTE: if simulateValidation passes successfully, there should be no reason for handleOps to fail on it.
 *  @param opIndex - index into the array of ops to the failed one (in simulateValidation, this is always zero)
 *  @param reason - revert reason
 *      The string starts with a unique code "AAmn", where "m" is "1" for factory, "2" for account and "3" for paymaster issues,
 *      so a failure can be attributed to the correct entity.
 *   Should be caught in off-chain handleOps simulation and not happen on-chain.
 *   Useful for mitigating DoS attempts against batchers or for troubleshooting of factory/account/paymaster reverts.
 */
error FailedOp(uint256 opIndex, string reason);

/**
 * error case when a signature aggregator fails to verify the aggregated signature it had created.
 */
error SignatureValidationFailed(address aggregator);

/**
 * Successful result from simulateValidation.
 * @param returnInfo gas and time-range returned values
 * @param senderInfo stake information about the sender
 * @param factoryInfo stake information about the factory (if any)
 * @param paymasterInfo stake information about the paymaster (if any)
 */
error ValidationResult(
    ReturnInfo returnInfo,
    StakeInfo senderInfo,
    StakeInfo factoryInfo,
    StakeInfo paymasterInfo
);

error ValidationResultWithAggregation(
    ReturnInfo returnInfo,
    StakeInfo senderInfo,
    StakeInfo factoryInfo,
    StakeInfo paymasterInfo,
    AggregatorStakeInfo aggregatorInfo
);

/**
 * return value of getSenderAddress
 */
error SenderAddressResult(address sender);

/**
 * return value of simulateHandleOp
 */
error ExecutionResult(
    uint256 preOpGas,
    uint256 paid,
    uint48 validAfter,
    uint48 validUntil,
    bool targetSuccess,
    bytes targetResult
);
