import { useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { makeBuyOrder, makeSellOrder } from '../store/interactions';

const Order = () => {
    const [isBuy, setIsBuy] = useState(true)
    const [amount, setAmount] = useState(0)
    const [price, setPrice] = useState(0)

    const provider = useSelector(state => state.provider.connection)
    const exchange = useSelector(state => state.exchange.contract)
    const tokens = useSelector(state => state.tokens.contracts)
    
    const dispatch = useDispatch()

    const buyRef = useRef(null)
    const sellRef = useRef(null)

    const tabHandler = (e) => {
        if(e.target.className !== buyRef.current.className){
            e.target.className = 'tab tab--active';
            buyRef.current.className = 'tab';
            setIsBuy(false)
        } else {
            e.target.className = 'tab tab--active';
            sellRef.current.className = 'tab';
            setIsBuy(true)
        }
    }

    const buyHandler = (e) => {
        e.preventDefault(); // prevents the refresh of the entire page
        makeBuyOrder(provider, exchange, tokens, {amount, price}, dispatch)
        setAmount(0)
        setPrice(0)
    }

    const sellHandler = (e) => {
        e.preventDefault(); // prevents the refresh of the entire page
        makeSellOrder(provider, exchange, tokens, {amount, price}, dispatch)
        setAmount(0)
        setPrice(0)
    }

    return (
      <div className="component exchange__orders">
        <div className='component__header flex-between'>
          <h2>New Order</h2>
          <div className='tabs'>
            <button onClick={tabHandler} ref={buyRef} className='tab tab--active'>Buy</button>
            <button onClick={tabHandler} ref={sellRef} className='tab'>Sell</button>
          </div>
        </div>
  
        <form onSubmit={isBuy ? buyHandler : sellHandler}>

            {isBuy ? (
                <span>Buy Amount</span>
            ) : (
                <span>Sell Amount</span>
            )}

          <input 
            type="text" 
            id='amount'
            placeholder='0.0000'
            value={amount === 0 ? '' : amount}
            onChange={(e) => setAmount(e.target.value)}
            />
  
            {isBuy ? (
                <span>Buy Price</span>
            ) : (
                <span>Sell Price</span>
            )}

          <input 
            type="text"
            id='price' 
            placeholder='0.0000'
            value={price === 0 ? '' : price}
            onChange={(e) => setPrice(e.target.value)}
            />
  
          <button className='button button--filled' type='submit'>

          </button>
        </form>
      </div>
    );
  }
  
  export default Order;