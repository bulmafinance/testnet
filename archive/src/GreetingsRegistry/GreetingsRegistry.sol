// SPDX-License-Identifier: MIT
pragma solidity ^0.7.0;

import "hardhat-deploy/solc_0.7/proxy/Proxied.sol";

contract GreetingsRegistry is Proxied {
    event MessageChanged(address indexed user, string message);

    mapping(address => string) public messages;
    string public _prefix;
    string public _newVariable;
    string public _newVariable2;

    function initialize(string memory prefix) public proxied {
        _prefix = prefix;
    }

    function setMessage(string calldata message) external {
        string memory actualMessage = string(abi.encodePacked(_prefix, message));
        messages[msg.sender] = actualMessage;
        emit MessageChanged(msg.sender, actualMessage);
    }
}
