// SPDX-License-Identifier: MIT
pragma solidity ^0.8.15;

import "./DepositPaymaster.sol";

contract PaymasterFactory {
    address[] public PaymasterAddress;
    uint256 _count;

    // count for project number.
    constructor() {
        _count = 0;
    }

    function createPaymaster(IEntryPoint entrypoint) public {
        DepositPaymaster paymaster = new DepositPaymaster(entrypoint, msg.sender);
        PaymasterAddress.push(address(paymaster));

        // add project number
        _count++;
    }

    function count() public view returns (uint256) {
        return _count;
    }

    function getPaymasterAddress(uint256 cnt) public view returns (address paymaster) {
        return PaymasterAddress[cnt];
    }
}
