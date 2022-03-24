// For a new deployment, create the config file in /deploy/configs/all
// Then copy-paste the configuration into /deploy/configs/current.ts

var config = {
    erc20Token: { 
        deployNew: true,  // Will deploy a new token if true
        name: "TestBulmaFinance",
        symbol: "tBULMA",
        totalSupply: 9000, // in standard units (decimals: 18)
        address: "" // Leave empty if deployNew is true
    },
}

export default config;