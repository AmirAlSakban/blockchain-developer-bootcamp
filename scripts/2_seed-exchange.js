const config = require('../src/config.json');
const hre = require("hardhat"); //this line if necessary if you run the script with `node <script>`; it is not if you run the script with `npx hardhat run <script>`

const tokens = (n) => {
    return ethers.utils.parseUnits(n.toString(), 'ether'); 
};

const wait = (seconds) => {
    const milliseconds = seconds * 1000;
    return new Promise(resolve => setTimeout(resolve, milliseconds));
};

async function main() {
    //fetch accounts from wallet
    const accounts = await ethers.getSigners();

    //fetch network
    const {chainId} = await ethers.provider.getNetwork();
    console.log(`Chain ID: `, chainId);

    const DApp = await ethers.getContractAt("Token", config[chainId].DApp.address);
    console.log(`DApp Token fetched: ${DApp.address}\n`);

    const mETH = await ethers.getContractAt("Token", config[chainId].mETH.address);
    console.log(`mETH Token fetched: ${mETH.address}\n`);

    const mDAI = await ethers.getContractAt("Token", config[chainId].mDAI.address);
    console.log(`mDAI Token fetched: ${mDAI.address}\n`);

    const exchange = await ethers.getContractAt("Exchange", config[chainId].exchange.address);
    console.log(`Exchange fetched: ${exchange.address}\n`);

    //give tokens to accounts[1]
    const sender = accounts[0];
    const receiver = accounts[1];
    let amount = tokens(10000)

    //user1 transfers 10000 mETH 
    let transaction, result;
    transaction = await mETH.connect(sender).transfer(receiver.address, amount);
    console.log(`Transferring ${amount} mETH from ${sender.address} to ${receiver.address}\n`);

    //setup exchange users
    const user1 = accounts[0];
    const user2 = accounts[1];
    amount = tokens(10000);

    //user1 approves 10000 dapp
    transaction = await DApp.connect(user1).approve(exchange.address, amount);
    result = await transaction.wait();
    console.log(`Approved ${amount} DApp from ${user1.address} to ${exchange.address}\n`);

    //user1 deposits 10000 dapp
    transaction = await exchange.connect(user1).depositToken(DApp.address, amount);
    result = await transaction.wait();
    console.log(`Deposited ${amount} DApp from ${user1.address} to ${exchange.address}\n`);

    //user2 approves mETH
    transaction = await mETH.connect(user2).approve(exchange.address, amount);
    result = await transaction.wait();
    console.log(`Approved ${amount} mETH from ${user2.address} to ${exchange.address}\n`);

    //user2 deposits mETH
    transaction = await exchange.connect(user2).depositToken(mETH.address, amount);
    result = await transaction.wait();
    console.log(`Deposited ${amount} mETH from ${user2.address} to ${exchange.address}\n`);

    /////////////////////////////////////////////////////
    //seed a cancelled order
    //

    //user1 makes an order to get tokens
    let orderId;
    transaction = await exchange.connect(user1).makeOrder(mETH.address, tokens(100), DApp.address, tokens(5));
    result = await transaction.wait();
    console.log(`Order made by ${user1.address}\n`);

    //user1 cancels the order
    orderId = result.events[0].args.id;
    transaction = await exchange.connect(user1).cancelOrder(orderId);
    result = await transaction.wait();
    console.log(`Order cancelled by ${user1.address}\n`);

    //wait 1 second
    await wait(1);

    /////////////////////////////////////////////////////
    //seed a filled order
    //

    //user1 makes an order to get tokens
    orderId = 2;
    transaction = await exchange.connect(user1).makeOrder(mETH.address, tokens(100), DApp.address, tokens(10));
    result = await transaction.wait();
    console.log(`Order made by ${user1.address}\n`);

    //user2 fills the order
    orderId = result.events[0].args.id;
    transaction = await exchange.connect(user2).fillOrder(orderId);
    result = await transaction.wait();
    console.log(`Order filled by ${user2.address}\n`);

    //wait 1 second
    await wait(1);

    //User 1 makes another order 
    orderId = 3;
    transaction = await exchange.connect(user1).makeOrder(mETH.address, tokens(50), DApp.address, tokens(15));
    result = await transaction.wait();
    console.log(`Order made by ${user1.address}\n`);

    //user2 fills the order
    orderId = result.events[0].args.id;
    transaction = await exchange.connect(user2).fillOrder(orderId);
    result = await transaction.wait();
    console.log(`Order filled by ${user2.address}\n`);

    //wait 1 second
    await wait(1);

    //User 1 makes final order
    transaction = await exchange.connect(user1).makeOrder(mETH.address, tokens(200), DApp.address, tokens(20));
    result = await transaction.wait();
    console.log(`Order made by ${user1.address}\n`);

    //user2 fills the final order
    orderId = result.events[0].args.id;
    transaction = await exchange.connect(user2).fillOrder(orderId);
    result = await transaction.wait();
    console.log(`Order filled from ${user1.address}\n`);

    //wait 1 second
    await wait(1);

    /////////////////////////////////////////////////////
    //seed open orders
    //

    //user1 makes 10 orders
    for (let i = 1; i <= 10; i++) {
        transaction = await exchange.connect(user1).makeOrder(mETH.address, tokens(10 * i), DApp.address, tokens(10));
        result = await transaction.wait();
        console.log(`Order ${i} made by ${user1.address}\n`);
        await wait(1);
    }

    //user2 makes 10 orders
    for (let i = 1; i <= 10; i++) {
        transaction = await exchange.connect(user2).makeOrder(DApp.address, tokens(10), mETH.address, tokens(10 * i));
        result = await transaction.wait();
        console.log(`Order ${i} made by ${user2.address}\n`);
        await wait(1);
    }    
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
