// For a new deployment, create the config file in /deploy/configs/all
// Then copy-paste the configuration into /deploy/configs/current.ts

var config = {
    erc20Token: { 
        deployNew: false,  // Will deploy a new token if true
        name: "Wrapped Ether 4",
        symbol: "WETH4",
        totalSupply: 20000000, // in standard units (decimals: 18), only used if deployNew is true
        address: "0xc778417E063141139Fce010982780140Aa0cD5Ab" // Leave empty if deployNew is true
    },
}

export default config;