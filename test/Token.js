// import { expect } from 'chai';
const { expect } = require('chai');
const { ethers } = require('hardhat');

const tokens = (n) => {
    return ethers.utils.parseUnits(n.toString(), 'ether'); 
};

describe('Token', () => {
    let token, accounts, deployer, receiver, exchange;

    beforeEach(async () => {
        //fetch token from blockchain
        const Token = await ethers.getContractFactory('Token')
        token =await Token.deploy('Dapp University', 'DAPP', '1000000')

        accounts = await ethers.getSigners();//get an array with all accounts
        deployer = accounts[0];// get the first account from the array
        receiver = accounts[1];// get the second account from the array
        exchange = accounts[2];// get the third account from the array
    });
        
    describe('Deployment', () => {
        const name = 'Dapp University';
        const symbol = 'DAPP';
        const decimals = '18';
        const totalSupply = tokens('1000000');


        it('has correct name', async () => {             
            expect(await token.name()).to.equal(name)
        });

        it('has correct symbol', async () => {            
            expect(await token.symbol()).to.equal(symbol)
        });

        it('has correct decimals', async () => {             
            expect(await token.decimals()).to.equal(decimals)
        });

        it('has correct total supply', async () => {  
            expect(await token.totalSupply()).to.equal(totalSupply)
        });

        it('assigns total supply to deployer', async () => {  
            expect(await token.balanceOf(deployer.address)).to.equal(totalSupply)
        });

    });

    describe('Sending Tokens', () => {
        let amount, transaction, result;

        describe('Success', async () => {
            beforeEach(async () => {
                amount = tokens('100');
                transaction = await token.connect(deployer).transfer(receiver.address, amount)
                result = await transaction.wait()
            });

            it('transfers token balances', async () => {
                //ensure that tokens were transfered (balance change)
                expect(await token.balanceOf(deployer.address)).to.equal(tokens(999900))
                expect(await token.balanceOf(receiver.address)).to.equal(amount)
            })

            it('emits Transfer event', async () => {
                //ensure that the transfer event was emitted
                const event = result.events[0]
                expect(event.event).to.equal('Transfer')

                const args = event.args
                expect(args.from).to.equal(deployer.address)
                expect(args.to).to.equal(receiver.address) 
                expect(args.value).to.equal(amount)
            })
        });

        describe('Failure', async () => {
            it('rejects insufficient balances', async () => {
                amount = tokens('100000000')// 100 million tokens
                await expect(token.connect(deployer).transfer(receiver.address, amount)).to.be.revertedWith('Insufficient balance')
            });

            it('rejects invalid recipient', async () => {
                amount = tokens('100')
                await expect(token.connect(deployer).transfer(ethers.constants.AddressZero, amount)).to.be.reverted
            });
        });
    
    });

    describe('Approving Tokens', () => {
        let amount, transaction, result;

        beforeEach(async () => {
            amount = tokens('100')
            transaction = await token.connect(deployer).approve(receiver.address, amount)
            result = await transaction.wait()
        });

        describe('Success', async () => {
            if('allocates an allowance for delegated token spending', async () => {
                amount = tokens('100')
                await token.connect(deployer).approve(receiver.address, amount)
                expect(await token.allowance(deployer.address, receiver.address)).to.equal(amount)
            });
        });

        it('emits Approval event', async () => {
            const event = result.events[0]
            expect(event.event).to.equal('Approval')

            const args = event.args
            expect(args.owner).to.equal(deployer.address)
            expect(args.spender).to.equal(receiver.address)
            expect(args.value).to.equal(amount)
        });


        describe('Failure', async () => {
            it('rejects invalid spender', async () => {
                await expect(token.connect(deployer).approve(ethers.constants.AddressZero, amount)).to.be.reverted
            });
        });


    });

    describe('Delegated Token Transfers', () => {
        let amount, transaction, result;

        beforeEach(async () => {
            amount = tokens('100')
            transaction = await token.connect(deployer).approve(exchange.address, amount)
            result = await transaction.wait()
        });

        describe('Success', async () => {
            beforeEach(async () => {
                transaction = await token.connect(exchange).transferFrom(deployer.address, receiver.address, amount)
                result = await transaction.wait()
            });

            it('transfers token balances', async () => {
                expect(await token.balanceOf(deployer.address)).to.be.equal(tokens(999900)) //to.be.equal and to.equal are functionally equivalent 
                expect(await token.balanceOf(receiver.address)).to.be.equal(amount)
            });

            it('resets the allowance', async () => {
                expect(await token.allowance(deployer.address, exchange.address)).to.be.equal(0)
            });

            it('emits Transfer event', async () => {
                const event = result.events[0]
                expect(event.event).to.equal('Transfer')

                const args = event.args
                expect(args.from).to.equal(deployer.address)
                expect(args.to).to.equal(receiver.address)
                expect(args.value).to.equal(amount)
            });
        });

        describe('Failure', async () => {
            // //attempt to transfer too many tokens
            const invalidAmount = tokens('100000000') // 100 million - greater than total supply
            await expect(token.connect(exchange).transferFrom(deployer.address, receiver.address, invalidAmount)).to.be.revertedWith('Insufficient balance')
        });

    });

});