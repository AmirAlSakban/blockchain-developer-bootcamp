// const { ethers } = require("hardhat");

// async function main() {
//     const Greeter = await hre.ethers.getContractFactory("Greeter");
//     const greeter = await Greeter.deploy("Hello, Hardhat!");

//     await greeter.deployed();

//     console.log("Greeter deployed to:", greeter.address);
// }

// main()
//     .then(() => process.exit(0))
//     .catch((error) => {
//         console.error(error);
//         process.exit(1);
//     });
// async function main() {
//     console.log('Preparing to deploy contract...\n');

//     //fetch contract to deploy
//     const Token = await ethers.getContractFactory("Token");
//     const Exchange = await ethers.getContractFactory("Exchange");

//     const accounts = await ethers.getSigners()

//     console.log('Accounts fetched: \n${accounts[0].address} \n${accounts[1].address}\n');

//     //deploy contract
//     const dapp = await Token.deploy('Dapp University', 'DAPP', '1000000');
//     await dapp.deployed();
//     console.log(`DAPP deployed to: ${dapp.address}`);

//     const mETH = await Token.deploy('mETH', 'mETH', '1000000');
//     await mETH.deployed();
//     console.log(`mETH deployed to: ${mETH.address}`);

//     const mDAI = await Token.deploy('mDAI', 'mDAI', '1000000');
//     await mDAI.deployed();
//     console.log(`mDAI deployed to: ${mDAI.address}`);

//     const exchange = await Exchange.deploy(accounts[1].address, 10);
//     await exchange.deployed();
//     console.log(`Exchange deployed to: ${exchange.address}`);
// }

// // We recommend this pattern to be able to use async/await everywhere
// // and properly handle errors.
// main()
//   .then(() => process.exit(0))
//   .catch((error) => {
//     console.error(error);
//     process.exit(1);
//   });

async function main() {
    console.log('Preparing to deploy contracts...\n');

    // Fetch contract factories
    const Token = await ethers.getContractFactory("Token");
    const Exchange = await ethers.getContractFactory("Exchange");

    // Fetch accounts
    const accounts = await ethers.getSigners();
    console.log(`Accounts fetched:\n${accounts[0].address}\n${accounts[1].address}\n`);

    // Deploy contracts
    const dapp = await Token.deploy('Dapp University', 'DAPP', '1000000');
    await dapp.deployed();
    console.log(`DAPP deployed to: ${dapp.address}`);

    const mETH = await Token.deploy('mETH', 'mETH', '1000000');
    await mETH.deployed();
    console.log(`mETH deployed to: ${mETH.address}`);

    const mDAI = await Token.deploy('mDAI', 'mDAI', '1000000');
    await mDAI.deployed();
    console.log(`mDAI deployed to: ${mDAI.address}`);

    const exchange = await Exchange.deploy(accounts[1].address, 10);
    await exchange.deployed();
    console.log(`Exchange deployed to: ${exchange.address}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
