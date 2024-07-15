//SPDX-license-identifier: Unlicense
pragma solidity ^0.8.0;

contract Token {
    string public name = "My Token";
    string public symbol = "MYHARD";
    uint256 public totalSupply = 1000000;
    mapping(address => uint256) public balances;

    constructor() {
        balances[msg.sender] = totalSupply;
    }

    

}
