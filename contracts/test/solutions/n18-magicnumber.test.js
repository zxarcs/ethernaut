
const MagicNumFactory = artifacts.require('./levels/MagicNumFactory.sol')
const MagicNum = artifacts.require('./levels/MagicNum.sol')
const utils = require('../utils/TestUtils')
const { expect } = require("chai")


describe.only("Challenge 18 - Magic Number", function () {
    let ethernaut
    let level
    let instance
    let attacker

    async function createLevelInstance() {
        const [_attacker] = await web3.eth.getAccounts()
        attacker = _attacker

        ethernaut = await utils.getEthernautWithStatsProxy()
        level = await MagicNumFactory.new()

        await ethernaut.registerLevel(level.address)

        instance = await utils.createLevelInstance(
            ethernaut,
            level.address,
            attacker,
            MagicNum,
            { value: web3.utils.toWei("0.001") }
        )
    }

    before(createLevelInstance)

    describe("Attack Execution", function () {
        /*
            Contract logic will consist of saving a number (i.e. 42, or 0x2a in hex) and
            then returning it. We will accomplish this with opcodes MLOAD and RETURN

            RUNTIME OPCODES

                Load the number to memory
                --------------------------
                0x60 (PUSH1)  0x2a (number 42).                   Final code = 0x602a
                0x60 (PUSH1)  0x80 (mem offset).                  Final code = 0x6080
                0x52 (MSTORE) Takes two previous codes as
                    input and stores the number 42 starting
                    at memory offset 0x80.                        Final code = 0x52
                .................................
                Section final code = 0x602a608052
                .................................
                
                
                Return the stored number
                --------------------------
                0x60 (PUSH1)  0x20 (32 -size of uint256 ).        Final code = 0x6020
                0x60 (PUSH1)  0x80 (mem offset).                  Final code = 0x6080
                0xf3 (RETURN) Takes two previous codes as
                    input, stops execution and returns
                    size of 32 bytes. As indicated by the
                    first push above                              Final code = 0xf3
                .................................
                Section final code = 0x60206080f3
                .................................


                Final code for our contract:
                0x602a60805260206080f3

                10 opcodes! That is the maximum in order to pass this challenge.

                That's it! we have "written" our contract. Hopefully this makes you
                appeciate writing these in Solidity instead manually like this :D

            DEPLOYING THE CONTRACT

                Now lets work on more opcodes that will take our contract above and
                load it into EVM. We will do very similar like we did above by
                using MSTORE and RETURN

                0x69 (PUSH10) 0x602a60805260206080f3 (Our "contract").
                    Our contract is 10 bytes long, so we are using
                    PUSH10 opcode.                                              Final code = 0x69602a60805260206080f3
                0x60 (PUSH1) 0x20 (mem offset)                                  Final code = 0x6020
                0x52 (MSTORE) Takes two previous codes as
                    input and stores the contract code
                    starting at memory offset 0x20.                             Final code = 0x52
                0x60 (PUSH1) 0x0a (10 -the size of out contract)                Final code = 0x600a
                0x60 (PUSH1) 0x36 (mem offset, decimal number 30)
                    This is calculated by starting offset (0x20) +
                    (32 bytes - code size, which is 10 bytes) =
                    0x20 + 22 bytes = 0x20 + 0x16 = 0x36                        Final code = 0x6036
                0xf3 (RETURN) Takes two previous codes as
                    input, stops execution and returns
                    size of 10 bytes. As indicated by the
                    push above                                                  Final code = 0xf3
                .................................
                Final code = 0x690x602a60805260206080f3602052600a6036f3
                .................................
        */

        it("construct contract manually", async function () {
            const finalByteCode = "0x69602a60805260206080f3602052600a6036f3"

            const data = {
                from: attacker,
                data: finalByteCode
            }

            const solverAddress = (await web3.eth.sendTransaction(data)).contractAddress        
            await instance.setSolver(solverAddress)

            expect(solverAddress).to.contain("0x")
        })
    })

    describe("Ethernaut Validation", function () {
        it("level successfully validated by Ethernaut", async function () {
            const result = await utils.submitLevelInstance(
                ethernaut,
                level.address,
                instance.address,
                attacker
            )

            expect(result).to.be.true
        })
    })
})