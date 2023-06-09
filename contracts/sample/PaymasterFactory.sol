// SPDX-License-Identifier: MIT
pragma solidity ^0.8.15;

import "./DepositPaymaster.sol";

contract PaymasterFactory {
    event PaymasterCreated(address paymaster, address owner);

    function createPaymaster(IEntryPoint entrypoint) public {
        DepositPaymaster paymaster = new DepositPaymaster(entrypoint, msg.sender);
        emit PaymasterCreated(address(paymaster), msg.sender);
    }
}
