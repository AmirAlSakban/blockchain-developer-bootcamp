//SPDX-license-identifier: Unlicense
pragma solidity ^0.8.0;
import "hardhat/console.sol";
import "./Token.sol";

contract Exchange {
    address public feeAccount;
    uint256 public feePercent;
    mapping(address => mapping(address => uint256)) public tokens; //user mapping
    mapping(uint256 => _Order) public orders; //order mapping
    uint256 public orderCount; //number of orders in the mapping 
    mapping(uint256 => bool) public orderCancelled; //mapping to check if an order has been cancelled

    event Deposit(address token, address user, uint256 amount, uint256 balance);
    event Withdraw(address token, address user, uint256 amount, uint256 balance);

    event Order(
        uint256 id, 
        address user, 
        address tokenGet, 
        uint256 amountGet, 
        address tokenGive, 
        uint256 amountGive, 
        uint256 timestamp
    );

    event Cancel(
        uint256 id, 
        address user, 
        address tokenGet, 
        uint256 amountGet, 
        address tokenGive, 
        uint256 amountGive, 
        uint256 timestamp
    );

    //orders mapping
    //a struct is a user-defined data type that is used to store a collection of data. This data can be of different types.
    //a way to model the data of an order
    struct _Order {
        uint256 id; //unique identifier for the order
        address user; //the user that created the order
        address tokenGet; //token that the user wants to get
        uint256 amountGet; //amount of token that the user wants to get
        address tokenGive; //token that the user wants to give
        uint256 amountGive; //amount of token that the user wants to give
        uint256 timestamp; //time the order was created
    }

    constructor(address _feeAccount, uint256 _feePercent) {
        feeAccount = _feeAccount;
        feePercent = _feePercent;
    }

    //--------------------------
    //DEPOSIT AND WITHDRAW TOKEN
    function depositToken(address _token, uint256 _amount) public {
        //transfer tokens to exchange
        require(Token(_token).transferFrom(msg.sender, address(this), _amount)); //address(this) retrieves the Ethereum address of the contract where this expression is used
       
        //update user balance
        tokens[_token][msg.sender] += _amount;

        //emit an event
        emit Deposit(_token, msg.sender, _amount, tokens[_token][msg.sender]);
    }
    
    function withdrawToken(address _token, uint256 _amount) public {
        //ensure user has enough tokens to withdraw
        require(tokens[_token][msg.sender] >= _amount); 

        //transfer tokens to the user
        Token(_token).transfer(msg.sender, _amount);
        
        //update user balance
        tokens[_token][msg.sender] -= _amount;

        //emit event
        emit Withdraw(_token, msg.sender, _amount, tokens[_token][msg.sender]);
    }

    //check balances
    function balanceOf(address _token, address _user)
    public 
    view
    returns (uint256) {
        return tokens[_token][_user];
    }

    //-------------------------
    // MAKE AND CANCEL ORDERS
    
    //token Give is the token that the user is giving
    //token Get is the token that the user is getting
    function makeOrder(
        address _tokenGet, 
        uint256 _amountGet,
        address _tokenGive,
        uint256 _amountGive
        ) public {
            //Prevent orders if tokens are'nt on the exchange
            require(balanceOf(_tokenGive, msg.sender) >= _amountGive);

            //Instantiate a new order   
            orderCount += 1; //increment the order count
            orders[orderCount] = _Order(
                orderCount, //unique identifier for the order
                msg.sender, //the user that created the order 
                _tokenGet, 
                _amountGet,
                _tokenGive, 
                _amountGive,
                block.timestamp //time the order was created, using epoch time (seconds since 1970); block.timestamp is a global variable that gives the current block timestamp
                ); 

            //emit an event
            emit Order(
                orderCount, //unique identifier for the order
                msg.sender, //the user that created the order 
                _tokenGet, 
                _amountGet,
                _tokenGive, 
                _amountGive,
                block.timestamp //time the order was created, using epoch time (seconds since 1970); block.timestamp is a global variable that gives the current block timestamp
            ); 

        //require that the amount is greater than 0
        require(_amountGet > 0 && _amountGive > 0);
        }

        function cancelOrder(uint256 _id) public {
            //fetch the order 
            _Order storage _order = orders[_id]; //storage is a keyword that tells the compiler to store the value in the state variable, not in memory

            //must be "my" order
            require(address(_order.user) == msg.sender); //check if the user is the owner of the order
             
            require(_order.id == _id); //check if the order exists and is valid
             
            orderCancelled[_id] = true; //set the order to cancelled
            // //remove the order
            // delete orders[_id];

            //emit event
            emit Cancel(
                _order.id,
                msg.sender,
                _order.tokenGet,
                _order.amountGet,
                _order.tokenGive,
                _order.amountGive,
                block.timestamp
            );
        }
}
