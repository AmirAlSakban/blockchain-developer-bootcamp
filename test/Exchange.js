// import { expect } from 'chai';
const { expect } = require('chai');
const { ethers } = require('hardhat');

const tokens = (n) => {
    return ethers.utils.parseUnits(n.toString(), 'ether'); 

};

describe('Exchange', () => {
    let deployer, feeAccount, exchange;

    const feePercent = 10; //fees taken by the exchange, expressed in percent 

    beforeEach(async () => {
    
        accounts = await ethers.getSigners();//get an array with all accounts
        deployer = accounts[0];// get the first account from the array
        feeAccount = accounts[1];// get the second account from the array
        
        const Exchange = await ethers.getContractFactory('Exchange')
        exchange =await Exchange.deploy(feeAccount.address, feePercent)

    });
    
        
    describe('Deployment', () => {
      
        it('tracks the fee account', async () => {             
            expect(await exchange.feeAccount()).to.equal(feeAccount.address)
        });

        it('tracks the fee percent', async () => {             
            expect(await exchange.feePercent()).to.equal(feePercent)
        });

    });

});