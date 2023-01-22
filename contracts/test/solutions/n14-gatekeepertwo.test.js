const GatekeeperTwoFactory = artifacts.require('./levels/GatekeeperTwoFactory.sol')
const GatekeeperTwo = artifacts.require('./levels/GatekeeperTwo.sol')
const GatekeeperTwoAttacker = artifacts.require('./attacks/N14GatekeeperTwoAttacker.sol')
const utils = require('../utils/TestUtils')
const { expect } = require("chai")


describe("Challenge 14 - GatekeeperTwo", function () {
    let ethernaut
    let level
    let instance
    let attacker

    async function createLevelInstance() {
        const [_attacker] = await web3.eth.getAccounts()
        attacker = _attacker

        ethernaut = await utils.getEthernautWithStatsProxy()
        level = await GatekeeperTwoFactory.new()

        await ethernaut.registerLevel(level.address)

        instance = await utils.createLevelInstance(
            ethernaut,
            level.address,
            attacker,
            GatekeeperTwo,
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
            
            Gate two: extcodesize(caller()) == 0 means that our attacking contract's size
                should evaluate to zero at run time, which is not true seeing that our contract
                has code in it that we wrote. But there is a workaround...
                
                Solution: A constructor is a special function that runs when we initially deploy
                a contract. While code execution is in the constructor, and we call another contract,
                if that contract was to run EXTCODESIZE opcode, it would show 0 for our contract.
                This is what we will use to get around gate two, everything will go inside our
                attacking contract's constructor function.

            Gate three: require(uint64(bytes8(keccak256(abi.encodePacked(msg.sender)))) ^ 
                uint64(_gateKey) == type(uint64).max);

                Solution: the XOR of our attacker contract's address and our gate key has to
                evaluate to type(uint64).max. Exclusive OR is true only if the bits are
                different and is false is bits are same. e.g. FALSE if 0^0 and also
                FALSE if 1^1. To pick the key, we will XOR with 0xFFFFFFFFFFFFFFFF. This will give us
                the opposite bits of our hash and when those two are XORed together, 
                we will get 0xFFFFFFFFFFFFFFFF, which is the goal of gate three.
        */
        it("open all gates", async function () {
            const maliciousContract = await GatekeeperTwoAttacker.new(instance.address)

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