const PreservationFactory = artifacts.require('./levels/PreservationFactory.sol')
const Preservation = artifacts.require('./levels/Preservation.sol')
const PreservationAttacker = artifacts.require('./attacks/N16PreservationAttacker.sol')
const utils = require('../utils/TestUtils')
const { expect } = require("chai")


describe.only("Challenge 16 - Preservation", function () {
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
        level = await PreservationFactory.new()

        await ethernaut.registerLevel(level.address)

        instance = await utils.createLevelInstance(
            ethernaut,
            level.address,
            attacker,
            Preservation,
        )
    }

    before(createLevelInstance)

    describe("Initial State", function () {
        it("instance owner is the level address", async function () {
            expect(await instance.owner()).to.eq(level.address)
        })
    })

    describe("Attack Execution", function () {
        /*
            This level introduces some more nightmare scenarios when it comes to dealing with DELEGATECALL opcode.

            First thing we should notice is that the two contracts we are given have different items at slot zero:
            * Preservation contract: storage at index zero is address type. Address of the contract to call.
            * LibraryContract contract: storage at index zero is (uint, an alias for) uint256 type. The timestamp.
            
            Also, important to note here is that these two types (address and uint256) are both 32 bytes long.
            We will take advantage of this by storing an address into the uint256 field (instead of a timestamp
            as it expects). This will make the storage at index zero be an address. The second time we go to call
            setFirstTime() function, that address we just put in previously will be used. That address will be of
            our malicious contract which will have an address in its index two storage memory set to our address.
        */
        it("change the contract owner", async function () {
            const maliciousContract = await PreservationAttacker.new(instance.address)
            await maliciousContract.attack()

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