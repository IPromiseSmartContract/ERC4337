// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;
import { StakeInfo } from "../StakeManager/structs.sol";

/**
 * returned data from validateUserOp.
 * validateUserOp returns a uint256, with is created by `_packedValidationData` and parsed by `_parseValidationData`
 * @param aggregator - address(0) - the account validated the signature by itself.
 *              address(1) - the account failed to validate the signature.
 *              otherwise - this is an address of a signature aggregator that must be used to validate the signature.
 * @param validAfter - this UserOp is valid only after this timestamp.
 * @param validaUntil - this UserOp is valid only up to this timestamp.
 */
struct ValidationData {
    address aggregator;
    uint48 validAfter;
    uint48 validUntil;
}

struct AggregatorStakeInfo {
    address actualAggregator;
    StakeInfo stakeInfo;
}
