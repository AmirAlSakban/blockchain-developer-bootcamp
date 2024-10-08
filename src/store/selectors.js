import { createSelector } from 'reselect';
import { get, groupBy, reject, maxBy, minBy } from 'lodash';
import { ethers } from 'ethers';
import moment from 'moment';


const account = state => get(state, 'provider.account')
const tokens = state => get(state, 'tokens.contracts')
const events = state => get(state, 'exchange.events')

const allOrders = state => get(state, 'exchange.allOrders.data', [])
const cancelledOrders = state => get(state, 'exchange.cancelledOrders.data', [])
const filledOrders = state => get(state, 'exchange.filledOrders.data', [])

const GREEN = '#25CE8F'
const RED = '#F45353'

const openOrders = state => {
    const all = allOrders(state)
    const filled = filledOrders(state)
    const cancelled = cancelledOrders(state)

    const openOrders = reject(all, (order) => {//reject is a lodash function that will return all orders that are not filled or cancelled
        const orderFilled = filled.some((o) => o.id.toString() === order.id.toString()) //this will return all orders that are not filled
        const orderCancelled = cancelled.some((o) => o.id.toString() === order.id.toString())//this will return all orders that are not cancelled
        return(orderFilled || orderCancelled)
    })

    return openOrders
}

//---------------------
// MY EVENTS
export const myEventsSelector = createSelector(
    account,
    events,
    (account, events) => {
        // Filter events created by current account
        events = events.filter((e) => e.args.user === account)
        console.log(events)
        // Sort events by date descending
        // events = events.sort((a, b) => b.timestamp - a.timestamp)

        return events
    }
)

//------------------
// MY OPEN ORDERS
export const myOpenOrdersSelector = createSelector(
    account,
    tokens,
    openOrders,
    (account, tokens, orders) => {
      if (!tokens[0] || !tokens[1]) { return }

      // Filter orders created by current account
      orders = orders.filter((o) => o.user === account)

      // Filter orders by token addresses
      orders = orders.filter((o) => o.tokenGet === tokens[0].address || o.tokenGet === tokens[1].address)
      orders = orders.filter((o) => o.tokenGive === tokens[0].address || o.tokenGive === tokens[1].address)

      // Decorate orders - add display attributes
      orders = decorateMyOpenOrders(orders, tokens)

      // Sort orders by date descending
      orders = orders.sort((a, b) => b.timestamp - a.timestamp)

      return orders
  }
)

const decorateMyOpenOrders = (orders, tokens) => {
    return(
      orders.map((order) => {
        order = decorateOrder(order, tokens)
        order = decorateMyOpenOrder(order, tokens)
        return(order)
      })
    )
  }
  
  const decorateMyOpenOrder = (order, tokens) => {
    let orderType = order.tokenGive === tokens[1].address ? 'buy' : 'sell'
  
    return({
      ...order,
      orderType,
      orderTypeClass: (orderType === 'buy' ? GREEN : RED)
    })
  }
    

const decorateOrder = (order, tokens) => {
    let token0Amount, token1Amount

    // Note: DApp should be considered token0, mETH is considered token1
    // Example: Giving mETH in exchange for DApp
    if (order.tokenGive === tokens[1].address) {
        token0Amount = order.amountGive // The amount of DApp we are giving
        token1Amount = order.amountGet // The amount of mETH we want...
    } else {
        token0Amount = order.amountGet // The amount of DApp we want
        token1Amount = order.amountGive // The amount of mETH we are giving...
    }
    
    // Calculate token price to 5 decimal places
    const precision = 100000
    let tokenPrice = (token1Amount / token0Amount)
    tokenPrice = Math.round(tokenPrice * precision) / precision

    return ({
        ...order,
        token0Amount: ethers.utils.formatUnits(token0Amount, "ether"),
        token1Amount: ethers.utils.formatUnits(token1Amount, "ether"),
        tokenPrice,
        formattedTimestamp: moment.unix(order.timestamp).format('h:mm:ssa d MMM D')
    })
}

//------------------
// FILLED ORDERS

export const filledOrdersSelector = createSelector(
    filledOrders,
    tokens, 
    (orders, tokens) => {
        if (!tokens[0] || !tokens[1]) { return }//this is a safeguard to prevent the function from running if tokens[0] or tokens[1] are not defined
    
        // Filter orders by selected tokens
        orders = orders.filter((o) => o.tokenGet === tokens[0].address || o.tokenGet === tokens[1].address)//this will filter the orders to only show the orders that are for the selected tokens
        orders = orders.filter((o) => o.tokenGive === tokens[0].address || o.tokenGive === tokens[1].address)

        // Step 1: sort orders by time ascending
        // Step 2: apply order colors (decorate orders)
        // Step 3: sort orders by time descending for UI

        // Sort orders by date ascending for price comparison
        orders = orders.sort((a, b) => a.timestamp - b.timestamp)

        // Decorate orders
        orders = decorateFilledOrders(orders, tokens)

        orders = orders.sort((a, b) => b.timestamp - a.timestamp)

        return orders
    }
)

const decorateFilledOrders = (orders, tokens) => {
    // track previous order to compare history
    let previousOrder = orders[0]

    return(
        orders.map((order) => {
            //decorate each order
            order = decorateOrder(order, tokens)
            order = decorateFilledOrder(order, previousOrder)
            previousOrder = order //update previous order
            return order
        })
    )
}

const decorateFilledOrder = (order, previousOrder) => {
    return ({
        ...order,
        tokenPriceClass: tokenPriceClass(order.tokenPrice, order.id, previousOrder)
    })
}

const tokenPriceClass = (tokenPrice, orderId, previousOrder) => {
    if (previousOrder.id === orderId) {
        return GREEN
    }
    
    // Show green price if order price is higher than previous order, red if lower
    if (previousOrder.tokenPrice <= tokenPrice) {
        return GREEN
    } else {
        return RED
    }
}

//------------------
// MY FILLED ORDERS
export const myFilledOrdersSelector = createSelector(
    account,
    tokens,
    filledOrders,
    (account, tokens, orders) => {
      if (!tokens[0] || !tokens[1]) { return }
        orders = orders.filter((o) => o.user === account || o.creator === account)
        //filter orders for current trading pair
        orders = orders.filter((o) => o.tokenGet === tokens[0].address || o.tokenGet === tokens[1].address)
        orders = orders.filter((o) => o.tokenGive === tokens[0].address || o.tokenGive === tokens[1].address)

        //sort by date descending
        orders = orders.sort((a, b) => b.timestamp - a.timestamp)

        //decorate orders - add display attributes
        orders = decorateMyFilledOrders(orders, account, tokens)

        return orders
  }
)

const decorateMyFilledOrders = (orders, account, tokens) => {
    return(
      orders.map((order) => {
        order = decorateOrder(order, tokens)
        order = decorateMyFilledOrder(order, account, tokens)
        return(order)
      })
    )
  }
  
  const decorateMyFilledOrder = (order, account, tokens) => {
    const myOrder = order.creator === account  

    let orderType = order.tokenGive === tokens[1].address ? 'buy' : 'sell'
    if(myOrder){
        orderType = order.tokenGive === tokens[1].address ? 'sell' : 'buy'
        }
    else{

    }
    return({
        ...order,
        orderType,
        orderClass: (orderType === 'buy' ? GREEN : RED),
        orderSign: (orderType === 'buy' ? '+' : '-')
    })
  }

//------------------
// ORDER BOOK

export const orderBookSelector = createSelector(
    openOrders,
    tokens, 
    (orders, tokens) => {

    if (!tokens[0] || !tokens[1]) { return }//this is a safeguard to prevent the function from running if tokens[0] or tokens[1] are not defined
    
    // Filter orders by selected tokens
    orders = orders.filter((o) => o.tokenGet === tokens[0].address || o.tokenGet === tokens[1].address)//this will filter the orders to only show the orders that are for the selected tokens
    orders = orders.filter((o) => o.tokenGive === tokens[0].address || o.tokenGive === tokens[1].address)
    
    // Decorate orders
    orders = decorateOrderBookOrders(orders, tokens)

    // Group orders by "orderType"
    orders = groupBy(orders, 'orderType')

    //Sort buy orders by token price
    const buyOrders = get(orders, 'buy', [])
    orders = {
        ...orders,
        buyOrders: buyOrders.sort((a, b) => b.tokenPrice - a.tokenPrice)
    }

    //Fetch sell orders
    const sellOrders = get(orders, 'sell', [])

    //sort sell orders by token price
    orders = {
        ...orders,
        sellOrders: sellOrders.sort((a, b) => b.tokenPrice - a.tokenPrice)
    }

    return orders
})

    const decorateOrderBookOrders = (orders, tokens) => {
        return(
            orders.map((order) => {
                order = decorateOrder(order, tokens)
                order = decorateOrderBookOrder(order, tokens)
                return(order)
            })
        )
    }

    const decorateOrderBookOrder = (order, tokens) => {
        const orderType = order.tokenGive === tokens[1].address ? 'buy' : 'sell'

        return({
            ...order,
            orderType,
            orderTypeClass: (orderType === 'buy' ? GREEN : RED),
            orderFillAction: (orderType === 'buy' ? 'sell' : 'buy')
        })
    }
    
//------------------
// PRICE CHART

export const PriceChartSelector = createSelector(
    openOrders,
    tokens, 
    (orders, tokens) => {
        if (!tokens[0] || !tokens[1]) { return }//this is a safeguard to prevent the function from running if tokens[0] or tokens[1] are not defined
        
        // Filter orders by selected tokens
        orders = orders.filter((o) => o.tokenGet === tokens[0].address || o.tokenGet === tokens[1].address)
        orders = orders.filter((o) => o.tokenGive === tokens[0].address || o.tokenGive === tokens[1].address)

        //sort orders by timestamp
        orders = orders.sort((a, b) => a.timestamp - b.timestamp)

        // Decorate orders - add display attributes
        orders = orders.map((o) => decorateOrder(o, tokens))

        // Get last 2 orders for final price & price change
        let secondLastOrder, lastOrder
        [secondLastOrder, lastOrder] = orders.slice(orders.length - 2, orders.length)

        const lastPrice = get(lastOrder, 'tokenPrice', 0)

        const secondLastPrice = get(secondLastOrder, 'tokenPrice', 0)

        return ({
            lastPrice,
            lastPriceChange: lastPrice >= secondLastPrice ? '+' : '-',
            series: [{
               // each candle entry goes here...
               data: buildGraphData(orders)
            }]
        })        
    }
)

const buildGraphData = (orders) => {

    orders = groupBy(orders, (o) => moment.unix(o.timestamp).startOf('hour').format())
    
    // Get the hours where data exists
    const hours = Object.keys(orders)
    
    const graphData = hours.map((hour) => {
        // fetch all orders for the hour
        const group = orders[hour]

        // Calculate prices: open, high, low, close
        const open = group[0]
        const high = maxBy(group, 'tokenPrice')
        const low = minBy(group, 'tokenPrice')
        const close = group[group.length - 1]

        return({
            x: new Date(hour),
            y: [open.tokenPrice, high.tokenPrice, low.tokenPrice, close.tokenPrice]
        })
    })
    return graphData
}
