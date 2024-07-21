//SPDX-license-identifier: Unlicense
pragma solidity ^0.8.0;
import "hardhat/console.sol";
import "./Token.sol";

contract Exchange {
    address public feeAccount;
    uint256 public feePercent;
    mapping(address => mapping(address => uint256)) public tokens; //user mapping

    event Deposit(address token, address user, uint256 amount, uint256 balance);
    event Withdraw(address token, address user, uint256 amount, uint256 balance);

    constructor(address _feeAccount, uint256 _feePercent) {
        feeAccount = _feeAccount;
        feePercent = _feePercent;
    }
    //--------------------------
    //deposit and withdraw token
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
}
