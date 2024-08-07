import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import config from '../config.json';

import { 
  loadProvider,
  loadNetwork,
  loadAccount,
  loadTokens,
  loadExchange
} from '../store/interactions';

function App() {

  const dispatch = useDispatch();

  const loadBlockchainData = async () => {

    //connect ethers to the blockchain
    const provider = loadProvider(dispatch);
    //fetch current network id (e.g. 1 for Ethereum Mainnet, 4 for Rinkeby Testnet, 31337 for hardhat local network)
    const chainId = await loadNetwork(provider, dispatch);    
    //fetch current account and balance from metamask
    await loadAccount(provider, dispatch);

    //load Token Smart Contracts
    const DApp = config[chainId].DApp
    const mETH = config[chainId].mETH
    await loadTokens(provider, [DApp.address, mETH.address], dispatch);

    //load Exchange Smart Contract
    const exchangeConfig = config[chainId].exchange
    await loadExchange(provider, exchangeConfig.address, dispatch);
  }

  useEffect(() => {
    loadBlockchainData();
  });

  return (
    <div>
      {/* Navbar */}
      <main className='exchange grid'>
        <section className='exchange__section--left grid'>
          {/* Markets */}
          {/* Balance */}
          {/* Order */}
        </section>
        <section className='exchange__section--right grid'>
          {/* PriceChart */}
          {/* Transactions */}
          {/* Trades */}
          {/* OrderBook */}
        </section>
      </main>
      {/* Alert */}
    </div>
  );
}

export default App;