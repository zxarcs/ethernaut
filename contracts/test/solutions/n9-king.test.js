const KingFactory = artifacts.require('./levels/KingFactory.sol')
const King = artifacts.require('./levels/King.sol')
const KingAttacker = artifacts.require('./attacks/N9KingAttacker.sol')
const utils = require('../utils/TestUtils')
const { expect } = require("chai")


describe("Challenge 9 - King", function () {
    let ethernaut
    let level
    let instance
    let attacker
    let regularUser

    const initialContribution = "1"
    const regularUserContribution = "2"

    async function createLevelInstance() {
        const [_attacker, _regularUser] = await web3.eth.getAccounts()
        attacker = _attacker
        regularUser = _regularUser

        ethernaut = await utils.getEthernautWithStatsProxy()
        level = await KingFactory.new()
        await ethernaut.registerLevel(level.address)

        instance = await utils.createLevelInstance(
            ethernaut,
            level.address,
            attacker,
            King,
            { from: attacker, value: web3.utils.toWei(initialContribution, "ether") }
        )
    }

    before(createLevelInstance)

    describe("Initial State", function () {
        it("instance owner is the level address", async function () {
            expect(await instance.owner()).to.eq(level.address)
        })

        
        it("king is the level address", async function () {
            expect(await instance._king()).to.eq(level.address)
        })
    })

    describe("Regular Usage", function () {
        it("lets regular users become kings", async function () {
            const tx = {
                from: regularUser,
                to: instance.address,
                value: web3.utils.toWei(regularUserContribution, "ether")
            }

            await web3.eth.sendTransaction(tx)

            expect(await instance._king()).to.be.equal(regularUser)
            expect(parseInt(await utils.getBalance(web3, instance.address)))
                .to.be.equal((parseInt(regularUserContribution) - parseInt(initialContribution)))
        })
    })

    describe("Attack Execution", function () {
        /*
            Sometimes the point is not to steal funds and break into vaults.
            In this challenge we will simply break the "King" game so that 
            no one can become the new king.

            We will become king in the regular as-intended way. Next, we
            will set up a contract with NO receive() function. This means that
            when new king is crowned and we are sent our funds as previous king,
            the transaction will fail.
            
            Because of this persistent failure, the game will be broken and no one
            will have fun playing it any more. What a wicked thing to do...
        */

        it("no one can become new king", async function () {
            const maliciousContract = await KingAttacker.new()
            await maliciousContract.kingMe(instance.address, { value: web3.utils.toWei("2", "ether") })
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