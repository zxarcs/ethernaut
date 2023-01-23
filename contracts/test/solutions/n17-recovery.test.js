const RecoveryFactory = artifacts.require('./levels/RecoveryFactory.sol')
const Recovery = artifacts.require('./levels/Recovery.sol')
const RecoveryAttacker = artifacts.require('./attcks/N17RecoveryAttacker.sol')
const utils = require('../utils/TestUtils')
const { expect } = require("chai")


describe.only("Challenge 17 - Recovery", function () {
    let ethernaut
    let level
    let instance
    let attacker
    let attackerAltAddress

    async function createLevelInstance() {
        const [_attacker, _alt] = await web3.eth.getAccounts()
        attacker = _attacker
        attackerAltAddress = _alt

        ethernaut = await utils.getEthernautWithStatsProxy()
        level = await RecoveryFactory.new()

        await ethernaut.registerLevel(level.address)

        instance = await utils.createLevelInstance(
            ethernaut,
            level.address,
            attacker,
            Recovery,
            { value: web3.utils.toWei("0.001") }
        )
    }

    before(createLevelInstance)

    describe("Attack Execution", function () {
        /*
            In blockchain internal operations, most everything is deterministic -
            It has to be... so that different nodes can come to same results.
            One example is what address a brand new contract will be assigned.
            To accomplish this, RLP encoding is used to encode the sender's
            address and their nonce. Details on RLP encoding can be read in the
            Ethereum developer docs webpage below:
            https://ethereum.org/en/developers/docs/data-structures-and-encoding/rlp/
            Once we know what (senders address + nonce), and how (RLP encoded) we can
            attempt to find the contract address where the funds are
        */

        it("recover funds", async function () {
            const preAttackFunds = await utils.getBalance(web3, attacker)

            const maliciousContract = await RecoveryAttacker.new()
            await maliciousContract.recover(instance.address, 0x01, attacker)

            const postAttackFunds = await utils.getBalance(web3, attacker)

            expect(Number(postAttackFunds)).to.be.gt(Number(preAttackFunds))
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