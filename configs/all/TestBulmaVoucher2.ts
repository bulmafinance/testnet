// For a new deployment, create the config file in /deploy/configs/all
// Then copy-paste the configuration into /deploy/configs/current.ts

var config = {
    erc20Token: { 
        deployNew: false,  // Will deploy a new token if true
        name: "TestBulmaFinance2",
        symbol: "tBULMA2",
        totalSupply: 9000, // in standard units (decimals: 18)
        address: "0x47D169d396eb52d7D4f6276CBAcbba4aeE358aC8" // Leave empty if deployNew is true
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