
const MagicNumFactory = artifacts.require('./levels/MagicNumFactory.sol')
const MagicNum = artifacts.require('./levels/MagicNum.sol')
const MagicNumAttacker = artifacts.require('./attcks/N18MagicNumberAttacker.sol')
const utils = require('../utils/TestUtils')
const { expect } = require("chai")


describe.only("Challenge 18 - Magic Number", function () {
    let ethernaut
    let level
    let instance
    let attacker
    let attackerAltAddress

    async function createLevelInstance() {
        const [_attacker, _alt] = await web3.eth.getAccounts()
        attacker = _attacker
        attackerAltAddress = _alt

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
        */

        it("construct contract manually", async function () {
            const maliciousContract = await MagicNumAttacker.new()
            await instance.setSolver(maliciousContract.address)

            const maliciousContractBytecode = await web3.eth.getCode(maliciousContract.address)
            console.log("bytecodes::", maliciousContractBytecode);
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