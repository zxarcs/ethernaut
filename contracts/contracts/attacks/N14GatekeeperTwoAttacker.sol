//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../levels/GatekeeperTwo.sol";

contract N14GatekeeperTwoAttacker {
    constructor(address targetAddr) {
        GatekeeperTwo gk2 = GatekeeperTwo(targetAddr);
        bytes8 gateKey = bytes8(
            bytes8(keccak256(abi.encodePacked(address(this)))) ^ 0xFFFFFFFFFFFFFFFF
        );

        gk2.enter(gateKey);
    }
}
