//SPDX-license-identifier: Unlicense
pragma solidity ^0.8.0;

contract Token {
    string public name;
    string public symbol = "DAPP";
    uint256 public decimals = 18;
    uint256 public totalSupply = 1000000 * (10 ** decimals); //10^ decimals = 10^18

    //track balances for each account
    mapping(address => uint256) public balanceOf;

    //send tokens 

    
   constructor(string memory _name, string memory _symbol, uint256 _totalSupply) {
       name = _name;
       symbol = _symbol;
       totalSupply = _totalSupply * (10 ** decimals); //10^ decimals = 10^18
       balanceOf[msg.sender] = totalSupply;
   }

}
