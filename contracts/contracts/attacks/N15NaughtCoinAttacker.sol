//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../levels/NaughtCoin.sol";

contract N15NaughtCoinAttacker {
    NaughtCoin nc;

    constructor(address targetAddr) {
        nc = NaughtCoin(targetAddr);
    }

    function unlock() public returns (bool) {
        uint256 a;
    }
}