const TelephoneFactory = artifacts.require('./levels/TelephoneFactory.sol')
const Telephone = artifacts.require('./levels/Telephone.sol')
const TelephoneAttacker = artifacts.require('./attacks/N4TelephoneAttacker.sol')
const utils = require('../utils/TestUtils')
const { expect } = require("chai")


describe("Challenge 4 - Telephone", function () {
    let ethernaut
    let level
    let instance
    let attacker

    async function createLevelInstance() {
        const [_attacker] = await web3.eth.getAccounts()
        attacker = _attacker

        ethernaut = await utils.getEthernautWithStatsProxy()
        level = await TelephoneFactory.new()
        await ethernaut.registerLevel(level.address)

        instance = await utils.createLevelInstance(
            ethernaut,
            level.address,
            attacker,
            Telephone
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
            //deploy attacker contract
            const maliciousContract = await TelephoneAttacker.new(instance.address, { from: attacker });

            await maliciousContract.attack({ from: attacker })
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