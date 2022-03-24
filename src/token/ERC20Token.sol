// SPDX-License-Identifier: MIT

pragma solidity 0.7.6;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract ERC20Token is ERC20 {
    constructor(address minter, string memory name_, string memory symbol_, uint256 amount_) ERC20(name_, symbol_) {
        uint256 amount = amount_ * 1e18; //decimals 18
        _mint(minter, amount);
    }
}
