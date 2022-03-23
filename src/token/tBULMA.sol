// SPDX-License-Identifier: MIT

pragma solidity 0.7.6;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract TestBulma is ERC20 {

    constructor(address minter) ERC20("TestBulmaFinance", "tBULMA") {
        uint256 amount = 9000 * 1e18; //decimals 18
        _mint(minter, amount);
    }
}
