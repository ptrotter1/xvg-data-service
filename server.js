const config = require(`./config.json`);
const axios = require("axios");
const https = require("https");

function numberWithCommas(x) {
    var parts = x.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
  }

function getTotalBalance() {
    return new Promise(async (resolve, reject) => {
        let xvgBalance = 0;

        try {
            for (wallet of config.wallets) {
                let response = await axios.get(`https://verge-blockchain.info/ext/getbalance/${wallet}`);
                xvgBalance += response.data;
            }
    
            resolve(xvgBalance);
        } catch (e) {
            reject(e);
        }
    });
}

function getValue() {
    return new Promise(async (resolve, reject) => {
        try {
            let response = await axios.get(`https://min-api.cryptocompare.com/data/price?fsym=XVG&tsyms=${config.toSymbols.join(",")}`);
            resolve(response.data);
        } catch (e) {
            reject(e);
        }
    });
}

(async () => {
    let outArray = [];
    let decimals = 6;
    let padStart = 0;

    https.globalAgent.options.rejectUnauthorized = false;

    try {
        xvgBalance = await getTotalBalance();
        xvgValue = await getValue();

        outArray.push(`${numberWithCommas(xvgBalance.toFixed(decimals))} XVG`);
        Object.keys(xvgValue).forEach((key, index) => 
            outArray.push(`${numberWithCommas((xvgValue[key] * xvgBalance).toFixed(decimals))} ${key}`)
        );

        for (outStr of outArray) if (outStr.length > padStart) padStart = outStr.length;
        for (outStr of outArray) console.log(outStr.padStart(padStart));
    } catch (e) {
        throw e;
    }
})();