// For a new deployment, create the config file in /deploy/configs/all
// Then copy-paste the configuration into /deploy/configs/current.ts

var config = {
    erc20Token: { 
        deployNew: false,  // Will deploy a new token if true
        name: "Wrapped Ether",
        symbol: "WETH",
        totalSupply: 20000000, // in standard units (decimals: 18), only used if deployNew is true
        address: "0xc778417E063141139Fce010982780140Aa0cD5Ab" // Leave empty if deployNew is true
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