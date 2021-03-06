// For a new deployment, create the config file in /deploy/configs/all
// Then copy-paste the configuration into /deploy/configs/current.ts

var config = {
    // Used in Vesting Voucher and Convertible Voucher deployment
    erc20Token: { 
        deployNew: false,  // If true, we either get from a previous deployment by this repo, or deploy a new token.
        name: "TestBulmaFinance2",
        symbol: "tBULMA2",
        totalSupply: 9000, // in standard units (decimals: 18)
        address: "0x5d001e1741A2514C33034dd6eCD5C05D887463cE" // Leave empty if deployNew is true
    },
    
    // Used only in Convertible Voucher deployment
    convertibleVoucher: {
        // Used in the Convertible Pool
        priceDecimals: 8,
        valueDecimals: 26,

        // Used in the Convertible Voucher
        unitDecimals: 26
    },

    // Used only in Flexible Voucher deployment
    flexibleVoucher: {
        unitDecimals: 18
    }
}

export default config;