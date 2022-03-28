// SPDX-License-Identifier: MIT

pragma solidity 0.7.6;
import "../../commons/solidity-utils/misc/Constants.sol";
import "../../commons/solidity-utils/access/AdminControl.sol";
import "../../commons/solidity-utils/openzeppelin/math/SafeMathUpgradeable.sol";
import "../../commons/solidity-utils/openzeppelin/utils/EnumerableSetUpgradeable.sol";
import "../../commons/solidity-utils/math/SafeMathUpgradeable128.sol";
import "../../commons/solidity-utils/helpers/VNFTTransferHelper.sol";
import "../../commons/solidity-utils/helpers/ERC20TransferHelper.sol";
import "../../commons/solidity-utils/openzeppelin/utils/ReentrancyGuardUpgradeable.sol";
import "../../commons/solver/interface/IIVOSolver.sol";
import "../offering-market-core/PriceManager.sol";
import "./interface/ISolvMarketplace.sol";

interface IVNFT {
    function unitsInToken(uint256 tokenId)
        external
        view
        returns (uint256 units);
}

contract SolvConvertibleMarketplace is
    ISolvMarketplace,
    PriceManager,
    AdminControl,
    ReentrancyGuardUpgradeable
{
    using SafeMathUpgradeable for uint256;
    using SafeMathUpgradeable128 for uint128;
    using EnumerableSetUpgradeable for EnumerableSetUpgradeable.UintSet;
    using EnumerableSetUpgradeable for EnumerableSetUpgradeable.AddressSet;

    event NewSolver(IIVOSolver oldSolver, IIVOSolver newSolver);

    event AddMarket(
        address indexed voucher,
        uint128 precision,
        uint8 feePayType,
        uint8 feeType,
        uint128 feeAmount,
        uint16 feeRate
    );

    event RemoveMarket(address indexed voucher);

    event SetCurrency(address indexed currency, bool enable);

    event WithdrawFee(address voucher, uint256 reduceAmount);

    struct Sale {
        uint24 saleId;
        uint24 tokenId;
        uint32 startTime;
        address seller;
        PriceManager.PriceType priceType;
        uint128 total; //sale units
        uint128 units; //current units
        uint128 min; //min units
        uint128 max; //max units
        address voucher; //sale asset
        address currency; //pay currency
        bool useAllowList;
        bool isValid;
    }

    struct Market {
        bool isValid;
        uint128 precision;
        FeeType feeType;
        FeePayType feePayType;
        uint128 feeAmount;
        uint16 feeRate;
    }

    enum FeeType {
        BY_AMOUNT,
        FIXED
    }

    enum FeePayType {
        SELLER_PAY,
        BUYER_PAY
    }

    //saleId => struct Sale
    mapping(uint24 => Sale) public sales;

    //voucher => Market
    mapping(address => Market) public markets;

    EnumerableSetUpgradeable.AddressSet internal _currencies;
    EnumerableSetUpgradeable.AddressSet internal _vouchers;

    //voucher => saleId
    mapping(address => EnumerableSetUpgradeable.UintSet) internal _voucherSales;
    mapping(address => EnumerableSetUpgradeable.AddressSet)
        internal _allowAddresses;

    IIVOSolver public solver;
    uint24 public nextSaleId;
    uint24 public nextTradeId;

    // managers with authorities to set allow addresses of a voucher market
    mapping(address => EnumerableSetUpgradeable.AddressSet)
        internal allowAddressManagers;

    // records of user purchased units from an order
    mapping(uint24 => mapping(address => uint128)) internal saleRecords;

    modifier onlyAllowAddressManager(address voucher_) {
        require(
            msg.sender == _admin ||
                allowAddressManagers[voucher_].contains(msg.sender),
            "only manager"
        );
        _;
    }

    function initialize(IIVOSolver solver_) public {
        ReentrancyGuardUpgradeable.__ReentrancyGuard_init();
        AdminControl.__AdminControl_init(msg.sender);
        nextSaleId = 1;
        nextTradeId = 1;
        _setSolver(solver_);
    }

    function currencies() external view returns (address[] memory currencies_) {
        currencies_ = new address[](_currencies.length());
        for (uint256 i = 0; i < _currencies.length(); i++) {
            currencies_[i] = _currencies.at(i);
        }
    }

    function vouchers() external view returns (address[] memory vouchers_) {
        vouchers_ = new address[](_vouchers.length());
        for (uint256 i = 0; i < _vouchers.length(); i++) {
            vouchers_[i] = _vouchers.at(i);
        }
    }

    function publishFixedPrice(
        address voucher_,
        uint24 tokenId_,
        address currency_,
        uint128 min_,
        uint128 max_,
        uint32 startTime_,
        bool useAllowList_,
        uint128 price_
    ) external virtual override returns (uint24 saleId) {
        address seller = msg.sender;

        PriceManager.PriceType priceType = PriceManager.PriceType.FIXED;

        uint256 err = solver.operationAllowed(
            "publishFixedPrice",
            abi.encode(
                voucher_,
                tokenId_,
                seller,
                currency_,
                min_,
                max_,
                startTime_,
                useAllowList_,
                price_
            )
        );
        require(err == 0, "solver not allowed");
        saleId = _publish(
            seller,
            voucher_,
            tokenId_,
            currency_,
            priceType,
            min_,
            max_,
            startTime_,
            useAllowList_
        );
        PriceManager.setFixedPrice(saleId, price_);

        emit FixedPriceSet(
            voucher_,
            saleId,
            tokenId_,
            uint8(priceType),
            price_
        );
    }

    struct PublishDecliningPriceLocalVars {
        address voucher;
        uint24 tokenId;
        address currency;
        uint128 min;
        uint128 max;
        uint32 startTime;
        bool useAllowList;
        uint128 highest;
        uint128 lowest;
        uint32 duration;
        uint32 interval;
        address seller;
    }

    function publishDecliningPrice(
        address voucher_,
        uint24 tokenId_,
        address currency_,
        uint128 min_,
        uint128 max_,
        uint32 startTime_,
        bool useAllowList_,
        uint128 highest_,
        uint128 lowest_,
        uint32 duration_,
        uint32 interval_
    ) external virtual override returns (uint24 saleId) {
        PublishDecliningPriceLocalVars memory vars;
        vars.seller = msg.sender;
        vars.voucher = voucher_;
        vars.tokenId = tokenId_;
        vars.currency = currency_;
        vars.min = min_;
        vars.max = max_;
        vars.startTime = startTime_;
        vars.useAllowList = useAllowList_;
        vars.highest = highest_;
        vars.lowest = lowest_;
        vars.duration = duration_;
        vars.interval = interval_;

        require(vars.interval > 0, "interval cannot be 0");
        require(vars.lowest <= vars.highest, "lowest > highest");
        require(vars.duration > 0, "duration cannot be 0");

        uint256 err = solver.operationAllowed(
            "publishDecliningPrice",
            abi.encode(
                vars.voucher,
                vars.tokenId,
                vars.seller,
                vars.currency,
                vars.min,
                vars.max,
                vars.startTime,
                vars.useAllowList,
                vars.highest,
                vars.lowest,
                vars.duration,
                vars.interval
            )
        );
        require(err == 0, "solver not allowed");

        PriceManager.PriceType priceType = PriceManager
            .PriceType
            .DECLIINING_BY_TIME;
        saleId = _publish(
            vars.seller,
            vars.voucher,
            vars.tokenId,
            vars.currency,
            priceType,
            vars.min,
            vars.max,
            vars.startTime,
            vars.useAllowList
        );

        PriceManager.setDecliningPrice(
            saleId,
            vars.startTime,
            vars.highest,
            vars.lowest,
            vars.duration,
            vars.interval
        );

        emit DecliningPriceSet(
            vars.voucher,
            saleId,
            vars.tokenId,
            vars.highest,
            vars.lowest,
            vars.duration,
            vars.interval
        );
    }

    function _publish(
        address seller_,
        address voucher_,
        uint24 tokenId_,
        address currency_,
        PriceManager.PriceType priceType_,
        uint128 min_,
        uint128 max_,
        uint32 startTime_,
        bool useAllowList_
    ) internal returns (uint24 saleId) {
        require(markets[voucher_].isValid, "unsupported voucher");
        require(_currencies.contains(currency_), "unsupported currency");
        if (max_ > 0) {
            require(min_ <= max_, "min > max");
        }

        VNFTTransferHelper.doTransferIn(voucher_, seller_, tokenId_);

        IVNFT vnft = IVNFT(voucher_);
        uint256 units = vnft.unitsInToken(tokenId_);
        require(units <= uint128(-1), "exceeds uint128 max");

        saleId = _generateNextSaleId();

        sales[saleId] = Sale({
            saleId: saleId,
            seller: msg.sender,
            tokenId: tokenId_,
            total: uint128(units),
            units: uint128(units),
            startTime: startTime_,
            min: min_,
            max: max_,
            voucher: voucher_,
            currency: currency_,
            priceType: priceType_,
            useAllowList: useAllowList_,
            isValid: true
        });
        Sale storage sale = sales[saleId];
        _voucherSales[voucher_].add(saleId);
        emit Publish(
            sale.voucher,
            sale.seller,
            sale.tokenId,
            saleId,
            uint8(sale.priceType),
            sale.units,
            sale.startTime,
            sale.currency,
            sale.min,
            sale.max,
            sale.useAllowList
        );
        solver.operationVerify(
            "publish",
            abi.encode(
                sale.voucher,
                sale.tokenId,
                sale.seller,
                sale.currency,
                sale.saleId,
                sale.units
            )
        );

        return saleId;
    }

    function buyByAmount(uint24 saleId_, uint256 amount_)
        external
        payable
        virtual
        override
        returns (uint128 units_)
    {
        Sale storage sale = sales[saleId_];
        address buyer = msg.sender;
        uint128 fee = _getFee(sale.voucher, amount_);
        uint128 price = PriceManager.price(sale.priceType, sale.saleId);
        uint256 units256;
        if (markets[sale.voucher].feePayType == FeePayType.BUYER_PAY) {
            amount_ = amount_.sub(fee, "fee exceeds amount");
            units256 = amount_
                .mul(uint256(markets[sale.voucher].precision))
                .div(uint256(price));
        } else {
            units256 = amount_
                .mul(uint256(markets[sale.voucher].precision))
                .div(uint256(price));
        }
        require(units256 <= uint128(-1), "exceeds uint128 max");
        units_ = uint128(units256);

        uint256 err = solver.operationAllowed(
            "buyByAmount",
            abi.encode(
                sale.voucher,
                sale.tokenId,
                saleId_,
                buyer,
                sale.currency,
                amount_,
                units_,
                price
            )
        );
        require(err == 0, "solver not allowed");

        _buy(buyer, sale, amount_, units_, price, fee);
        return units_;
    }

    function buyByUnits(uint24 saleId_, uint128 units_)
        external
        payable
        virtual
        override
        returns (uint256 amount_, uint128 fee_)
    {
        Sale storage sale = sales[saleId_];
        if (markets[sale.voucher].feePayType == FeePayType.BUYER_PAY) {
            require(sale.currency != Constants.ETH_ADDRESS, "buyByUnits unsupported");
        }

        address buyer = msg.sender;
        uint128 price = PriceManager.price(sale.priceType, sale.saleId);

        amount_ = uint256(units_).mul(uint256(price)).div(
            uint256(markets[sale.voucher].precision)
        );

        // if (
        //     sale.currency == Constants.ETH_ADDRESS &&
        //     sale.priceType == PriceType.DECLIINING_BY_TIME &&
        //     amount_ != msg.value
        // ) {
        //     amount_ = msg.value;
        //     uint128 fee = _getFee(sale.voucher, amount_);
        //     uint256 units256;
        //     if (markets[sale.voucher].feePayType == FeePayType.BUYER_PAY) {
        //         amount_ = amount_.sub(fee, "fee exceeds amount");
        //         units256 = amount_
        //             .mul(uint256(markets[sale.voucher].precision))
        //             .div(uint256(price));
        //     } else {
        //         units256 = amount_
        //             .mul(uint256(markets[sale.voucher].precision))
        //             .div(uint256(price));
        //     }
        //     if (units256 > sale.units) {
        //         units256 = sale.units;
        //     }
        //     require(units256 <= uint128(-1), "exceeds uint128 max");
        //     units_ = uint128(units256);
        // }

        fee_ = _getFee(sale.voucher, amount_);

        uint256 err = solver.operationAllowed(
            "buyByUnits",
            abi.encode(
                sale.voucher,
                sale.tokenId,
                saleId_,
                buyer,
                sale.currency,
                amount_,
                units_,
                price
            )
        );
        require(err == 0, "solver not allowed");

        _buy(buyer, sale, amount_, units_, price, fee_);
        return (amount_, fee_);
    }

    struct BuyLocalVar {
        uint256 transferInAmount;
        uint256 transferOutAmount;
        FeePayType feePayType;
    }

    function _buy(
        address buyer_,
        Sale storage sale_,
        uint256 amount_,
        uint128 units_,
        uint128 price_,
        uint128 fee_
    ) internal {
        require(sale_.isValid, "invalid saleId");
        require(block.timestamp >= sale_.startTime, "not yet on sale");
        if (sale_.units >= sale_.min) {
            require(units_ >= sale_.min, "min units not met");
        }
        if (sale_.max > 0) {
            uint128 purchased = saleRecords[sale_.saleId][buyer_].add(units_);
            require(purchased <= sale_.max, "exceeds purchase limit");
            saleRecords[sale_.saleId][buyer_] = purchased;
        }

        if (sale_.useAllowList) {
            require(
                _allowAddresses[sale_.voucher].contains(buyer_),
                "not in allow list"
            );
        }

        sale_.units = sale_.units.sub(units_, "insufficient units for sale");
        BuyLocalVar memory vars;
        vars.feePayType = markets[sale_.voucher].feePayType;

        if (vars.feePayType == FeePayType.BUYER_PAY) {
            vars.transferInAmount = amount_.add(fee_);
            vars.transferOutAmount = amount_;
        } else if (vars.feePayType == FeePayType.SELLER_PAY) {
            vars.transferInAmount = amount_;
            vars.transferOutAmount = amount_.sub(fee_, "fee exceeds amount");
        } else {
            revert("unsupported feePayType");
        }

        ERC20TransferHelper.doTransferIn(
            sale_.currency,
            buyer_,
            vars.transferInAmount
        );

        if (units_ == IVNFT(sale_.voucher).unitsInToken(sale_.tokenId)) {
            VNFTTransferHelper.doTransferOut(
                sale_.voucher,
                buyer_,
                sale_.tokenId
            );
        } else {
            VNFTTransferHelper.doTransferOut(
                sale_.voucher,
                buyer_,
                sale_.tokenId,
                units_
            );
        }
        ERC20TransferHelper.doTransferOut(
            sale_.currency,
            payable(sale_.seller),
            vars.transferOutAmount
        );

        emit Traded(
            buyer_,
            sale_.saleId,
            sale_.voucher,
            sale_.tokenId,
            _generateNextTradeId(),
            uint32(block.timestamp),
            sale_.currency,
            uint8(sale_.priceType),
            price_,
            units_,
            amount_,
            uint8(vars.feePayType),
            fee_
        );

        solver.operationVerify(
            "buy",
            abi.encode(
                sale_.voucher,
                sale_.tokenId,
                sale_.saleId,
                buyer_,
                sale_.seller,
                amount_,
                units_,
                price_,
                fee_
            )
        );

        if (sale_.units == 0) {
            emit Remove(
                sale_.voucher,
                sale_.seller,
                sale_.saleId,
                sale_.total,
                sale_.total - sale_.units
            );
            delete sales[sale_.saleId];
        }
    }

    function purchasedUnits(uint24 saleId_, address buyer_)
        external
        view
        returns (uint128)
    {
        return saleRecords[saleId_][buyer_];
    }

    function remove(uint24 saleId_) public virtual override {
        Sale memory sale = sales[saleId_];
        require(sale.isValid, "invalid sale");
        require(sale.seller == msg.sender, "only seller");

        uint256 err = solver.operationAllowed(
            "remove",
            abi.encode(sale.voucher, sale.tokenId, sale.saleId, sale.seller)
        );
        require(err == 0, "solver not allowed");

        VNFTTransferHelper.doTransferOut(
            sale.voucher,
            sale.seller,
            sale.tokenId
        );

        emit Remove(
            sale.voucher,
            sale.seller,
            sale.saleId,
            sale.total,
            sale.total - sale.units
        );
        delete sales[saleId_];
    }

    function _getFee(address voucher_, uint256 amount)
        internal
        view
        returns (uint128)
    {
        Market storage market = markets[voucher_];
        if (market.feeType == FeeType.FIXED) {
            return market.feeAmount;
        } else if (market.feeType == FeeType.BY_AMOUNT) {
            uint256 fee = amount.mul(uint256(market.feeRate)).div(
                uint256(Constants.FULL_PERCENTAGE)
            );
            require(fee <= uint128(-1), "Fee: exceeds uint128 max");
            return uint128(fee);
        } else {
            revert("unsupported feeType");
        }
    }

    function getPrice(uint24 saleId_)
        public
        view
        virtual
        override
        returns (uint128)
    {
        return PriceManager.price(sales[saleId_].priceType, saleId_);
    }

    function totalSalesOfICToken(address voucher_)
        public
        view
        virtual
        override
        returns (uint256)
    {
        return _voucherSales[voucher_].length();
    }

    function saleIdOfICTokenByIndex(address voucher_, uint256 index_)
        public
        view
        virtual
        override
        returns (uint256)
    {
        return _voucherSales[voucher_].at(index_);
    }

    function _generateNextSaleId() internal returns (uint24) {
        return nextSaleId++;
    }

    function _generateNextTradeId() internal returns (uint24) {
        return nextTradeId++;
    }

    function _addMarket(
        address voucher_,
        uint128 precision_,
        uint8 feePayType_,
        uint8 feeType_,
        uint128 feeAmount_,
        uint16 feeRate_
    ) external onlyAdmin {
        require(voucher_ != address(0), "voucher can not be 0 address");
        require(feeRate_ <= Constants.FULL_PERCENTAGE, "invalid fee rate");

        markets[voucher_].isValid = true;
        markets[voucher_].precision = precision_;
        markets[voucher_].feePayType = FeePayType(feePayType_);
        markets[voucher_].feeType = FeeType(feeType_);
        markets[voucher_].feeAmount = feeAmount_;
        markets[voucher_].feeRate = feeRate_;

        _vouchers.add(voucher_);

        emit AddMarket(
            voucher_,
            precision_,
            feePayType_,
            feeType_,
            feeAmount_,
            feeRate_
        );
    }

    function _removeMarket(address voucher_) external onlyAdmin {
        _vouchers.remove(voucher_);
        delete markets[voucher_];
        emit RemoveMarket(voucher_);
    }

    function _setCurrency(address currency_, bool enable_) external onlyAdmin {
        _currencies.add(currency_);
        emit SetCurrency(currency_, enable_);
    }

    function _withdrawFee(address currency_, uint256 reduceAmount_)
        external
        onlyAdmin
    {
        ERC20TransferHelper.doTransferOut(
            currency_,
            payable(_admin),
            reduceAmount_
        );
        emit WithdrawFee(currency_, reduceAmount_);
    }

    function _addAllowAddress(
        address voucher_,
        address[] calldata addresses_,
        bool resetExisting_
    ) external onlyAllowAddressManager(voucher_) {
        require(markets[voucher_].isValid, "unsupported voucher");
        EnumerableSetUpgradeable.AddressSet storage set = _allowAddresses[
            voucher_
        ];

        if (resetExisting_) {
            while (set.length() != 0) {
                set.remove(set.at(0));
            }
        }

        for (uint256 i = 0; i < addresses_.length; i++) {
            set.add(addresses_[i]);
        }
    }

    function _removeAllowAddress(
        address voucher_,
        address[] calldata addresses_
    ) external onlyAllowAddressManager(voucher_) {
        require(markets[voucher_].isValid, "unsupported voucher");
        EnumerableSetUpgradeable.AddressSet storage set = _allowAddresses[
            voucher_
        ];
        for (uint256 i = 0; i < addresses_.length; i++) {
            set.remove(addresses_[i]);
        }
    }

    function isBuyerAllowed(address voucher_, address buyer_)
        external
        view
        returns (bool)
    {
        return _allowAddresses[voucher_].contains(buyer_);
    }

    function setAllowAddressManager(
        address voucher_,
        address[] calldata managers_,
        bool resetExisting_
    ) external onlyAdmin {
        require(markets[voucher_].isValid, "unsupported voucher");
        EnumerableSetUpgradeable.AddressSet storage set = allowAddressManagers[
            voucher_
        ];
        if (resetExisting_) {
            while (set.length() != 0) {
                set.remove(set.at(0));
            }
        }

        for (uint256 i = 0; i < managers_.length; i++) {
            set.add(managers_[i]);
        }
    }

    function allowAddressManager(address voucher_, uint256 index_)
        external
        view
        returns (address)
    {
        return allowAddressManagers[voucher_].at(index_);
    }

    function _setSolver(IIVOSolver newSolver_) public virtual onlyAdmin {
        IIVOSolver oldSolver = solver;
        require(newSolver_.isSolver(), "invalid solver");
        solver = newSolver_;

        emit NewSolver(oldSolver, newSolver_);
    }
}
