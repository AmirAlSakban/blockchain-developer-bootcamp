const config = require('../src/config.json');
const { ethers } = require("hardhat");

async function main() {
    const chainId = 31337;
    const networkConfig = config[chainId];

    if (networkConfig) {
        console.log("Checking deployed contracts on chainId " + chainId + ":");

        // Check each address
        const addresses = {
            "DApp": networkConfig.DApp.address,
            "mETH": networkConfig.mETH.address,
            "mDAI": networkConfig.mDAI.address,
            "Exchange": networkConfig.exchange.address
        };

        for (const [key, address] of Object.entries(addresses)) {
            try {
                const code = await ethers.provider.getCode(address);
                console.log(`${key} at ${address}: ${code && code !== '0x' ? 'Deployed' : 'Not found'}`);
            } catch (error) {
                console.error(`Error checking ${key} at ${address}:`, error);
            }
        }
    } else {
        console.log("No configuration found for chainId " + chainId);
    }
}

main().catch((error) => {
    console.error("Unhandled error in main:", error);
    process.exit(1);
});
