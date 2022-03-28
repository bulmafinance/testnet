// SPDX-License-Identifier: MIT

pragma solidity 0.7.6;

import "../openzeppelin/utils/ContextUpgradeable.sol";
import "../openzeppelin/proxy/Initializable.sol";

abstract contract AdminControl is Initializable, ContextUpgradeable {

    event NewAdmin(address oldAdmin, address newAdmin);
    event NewPendingAdmin(address oldPendingAdmin, address newPendingAdmin);

    address public _admin;
    address public pendingAdmin;

    modifier onlyAdmin() {
        require(_msgSender() == _admin, "only admin");
        _;
    }

    function __AdminControl_init(address admin_) internal initializer {
        _admin = admin_;
    }

    function setPendingAdmin(address newPendingAdmin_) external virtual onlyAdmin {
        emit NewPendingAdmin(pendingAdmin, newPendingAdmin_);
        pendingAdmin = newPendingAdmin_;        
    }

    function acceptAdmin() external virtual {
        require(_msgSender() == pendingAdmin, "only pending admin");
        emit NewAdmin(_admin, pendingAdmin);
        _admin = pendingAdmin;
        pendingAdmin = address(0);
    }

}