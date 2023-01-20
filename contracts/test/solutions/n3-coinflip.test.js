const CoinFlipFactory = artifacts.require('./levels/CoinFlipFactory.sol')
const CoinFlip = artifacts.require('./levels/CoinFlip.sol')
const CoinFlipAttacker = artifacts.require('./attacks/N3CoinFlipAttacker.sol')
const utils = require('../utils/TestUtils')
const { expect } = require("chai")


describe("Challenge 3 - CoinFlip", function () {
    let ethernaut
    let level
    let instance
    let attacker

    async function createLevelInstance() {
        const [_attacker] = await web3.eth.getAccounts()
        attacker = _attacker

        ethernaut = await utils.getEthernautWithStatsProxy()
        level = await CoinFlipFactory.new()
        await ethernaut.registerLevel(level.address)

        instance = await utils.createLevelInstance(
            ethernaut,
            level.address,
            attacker,
            CoinFlip
        )
    }

    before(createLevelInstance)

    describe("Attack Execution", function () {
        it("flip correctly 10 times", async function () {
            //deploy malicious contract
            const maliciousContract = await CoinFlipAttacker.new(instance.address);

            for (let i = 0; i < 10; i++) {
                await maliciousContract.flipForWin()
            }
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