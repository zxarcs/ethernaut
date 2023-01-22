const NaughtCoinFactory = artifacts.require('./levels/NaughtCoinFactory.sol')
const NaughtCoin = artifacts.require('./levels/NaughtCoin.sol')
const NaughtCoinAttacker = artifacts.require('./attacks/N15NaughtCoinAttacker.sol')
const utils = require('../utils/TestUtils')
const { expect } = require("chai")
const chai = require("chai")
const { solidity } = require("ethereum-waffle")
chai.use(solidity)


describe("Challenge 15 - NaughtCoin", function () {
    let ethernaut
    let level
    let instance
    let attacker

    async function createLevelInstance() {
        const [_attacker] = await web3.eth.getAccounts()
        attacker = _attacker

        ethernaut = await utils.getEthernautWithStatsProxy()
        level = await NaughtCoinFactory.new()

        await ethernaut.registerLevel(level.address)

        instance = await utils.createLevelInstance(
            ethernaut,
            level.address,
            attacker,
            NaughtCoin,
        )
    }

    before(createLevelInstance)

    describe("Initial State", function () {

    })

    describe("Attack Execution", function () {
        /*
            The NaughtCoin contract only has a small amount of code in it.
            There is a much bigger piece of code "hidden" in ERC20 contract,
            from which the NaughtCoin contract is inheriting a lot of functionality.
            Since the modifier is restricting the transfer() usage, we will
            use approve together with transferFrom to pass this level.
        */
        it("unlocks the coins", async function () {
            const maliciousContract = await NaughtCoinAttacker.new(instance.address)
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