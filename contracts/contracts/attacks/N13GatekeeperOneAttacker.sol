//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../levels/GatekeeperOne.sol";

contract N13GatekeeperOneAttacker {
    GatekeeperOne gk1;

    constructor(address targetAddr) {
        gk1 = GatekeeperOne(targetAddr);
    }

    function openAllGates(bytes8 key) external returns (bool) {
        bool isOpened = gk1.enter(key);

        return isOpened;
    }
}
