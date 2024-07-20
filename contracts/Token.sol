//SPDX-license-identifier: Unlicense
pragma solidity ^0.8.0;

contract Token {
    string public name;
    string public symbol = "DAPP";
    uint256 public decimals = 18;
    uint256 public totalSupply = 1000000 * (10 ** decimals); //10^ decimals = 10^18

    //track balances for each account
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    event Transfer(
        address indexed from, 
        address indexed to, 
        uint256 value
    );

    event Approval(
        address indexed owner, 
        address indexed spender, 
        uint256 value
    );
    
   constructor(
    string memory _name,
    string memory _symbol,
    uint256 _totalSupply
    ) {
       name = _name;
       symbol = _symbol;
       totalSupply = _totalSupply * (10 ** decimals); //10^ decimals = 10^18
       balanceOf[msg.sender] = totalSupply;
   }

   function transfer(address _to, uint256 _value) 
       public 
       returns (bool success) 
       {
       //require that the sender has enough tokens
       require(balanceOf[msg.sender] >= _value, "Insufficient balance");
       require(_to != address(0), "Invalid address");
       //emit transfer event
       _transfer(msg.sender, _to, _value);
       return true;
   }

   function _transfer(
    address _from,
    address _to,
    uint256 _value
    ) internal {
        //require that the sender has enough tokens
        require(balanceOf[_from] >= _value, "Insufficient balance");
        require(_to != address(0), "Invalid address");
        //deduct tokens from spender
        balanceOf[_from] -= _value;
        //credit tokens to receiver
        balanceOf[_to] += _value;

        //emit transfer event
        emit Transfer(_from, _to, _value);

    }
   

   function approve(address _spender, uint256 _value) 
       public 
       returns (bool success) 
    {
        require(_spender != address(0), "Invalid address");
       //allowance
       allowance[msg.sender][_spender] = _value;

       emit Approval(msg.sender, _spender, _value);
       return true;
    }

    function transferFrom(
        address _from,
        address _to,
        uint256 _value
    )
        public 
        returns (bool success) 
    {
        //check if the sender has enough tokens
        require(_from != address(0), "Invalid address");
        require(_to != address(0), "Invalid address");
        require(_value <= balanceOf[_from], "Insufficient balance");
        require(_value <= allowance[_from][msg.sender], "Insufficient allowance");

        balanceOf[_from] -= _value;
        balanceOf[_to] += _value;

        allowance[_from][msg.sender] -= _value;

        //spend tokens
        emit Transfer(_from, _to, _value);
        // _transfer(_from, _to, _value);
        return true;
    }

}
