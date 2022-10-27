import Config from './components/config.js';
import errorHandler from './errorHandler.js';
import TransactionsBSC from './models/BSC/tx_PCS.js';
import TransactionsETH from './models/ETH/tx_UNI.js';
import {getSupply, getDecimals} from './components/nodeRequests.js';
import fetch from 'node-fetch';


const {webhook} = Config();
console.log('Start API')

// every 10 seconds check new data
setInterval(()=>{
    getNewTX('BSC');
    // getNewTX('ETH');
}, 10000);


/**
 * function to detect changes in a pair in the past 10 seconds
 * @param {string} network
 * 
 */
function getNewTX(network){
    const tx = network == 'BSC' ? TransactionsBSC : TransactionsETH; // only detect network not swap yet
    tx.find({
        createdAt:{
            $gte: new Date(Date.now() - 10000),
            $lt: new Date()
        }
    }).select('pairAddress').then(res=>{
        if(res.length < 1) return;

        let pairs = [...new Set(res.map(item => item.pairAddress))];
        
        pairs.map(address=>{
            aggregateChange(address, network, (data)=>{
                fetch(webhook, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data),
                });
            });
        });
    });
};


/**
 * 
 * @param {string} address 
 * @param {function} callback
 * @returns aggregated pair info
 */
function aggregateChange(address, network, callback){
    const tx = network == 'BSC' ? TransactionsBSC : TransactionsETH; // only detect network not swap yet
    const currentTime = parseInt((Date.now()/1000).toFixed(0));
    tx.aggregate([

        {$match:  {$and: [
            {pairAddress: address},
            {timestamp: {$gte: currentTime - 86400}}
        ]}},

        {$group:{
            _id: "$pairAddress",
            reserves0Open: {$first: "$reserves0"},
            reserves1Open: {$first: "$reserves1"},
            reserves0Close: {$last: "$reserves0"},
            reserves1Close: {$last: "$reserves1"},
            timeStart: {$first: "$timestamp"},
            timeEnd: {$last: "$timestamp"},
            amount0: {
                $sum: {
                    $toDecimal: "$token0Amount"
                }
            },
            amount1: {
                $sum: {
                    $toDecimal: "$token1Amount"
                }
            },
            pairAddress: {$last: "$pairAddress"},
            token0: {$last: "$token0"},
            token1: {$last: "$token1"},
            token0Symbol: {$last: "$symbol0"},
            token1Symbol: {$last: "$symbol1"},
            dex: {$last: "$DEX"},
            network: {$last: "$network"}
        }}
    ]).then(async(res)=>{

        const {reserves0Close, reserves1Close, reserves0Open, reserves1Open, amount0, amount1, pairAddress, token0, token1, token0Symbol, token1Symbol, dex, network} = res[0];

        const price0Open = reserves0Open / reserves1Open;
        const price0Close = reserves0Close / reserves1Close;
        
        const price1Open = reserves1Open / reserves0Open;
        const price1Close = reserves1Close / reserves0Close;

        const percDiff0 = (100 * Math.abs( (price0Open - price0Close) / (price0Open+price0Close) / 2 )).toFixed(2);
        const percDiff1 = (100 * Math.abs( (price1Open - price1Close) / (price1Open+price1Close) / 2 )).toFixed(2);

        const supply0 = await getSupply(token0, network);
        const supply1 = await getSupply(token1, network);

        const decimal0 = await getDecimals(token0, network);
        const decimal1 = await getDecimals(token1, network);

        const obj = {
            price0: price0Close,
            price1: price1Close,
            reserves0Close: reserves0Close, 
            reserves1Close: reserves1Close, 
            amount0: parseFloat(amount0), 
            amount1: parseFloat(amount1), 
            pairAddress: pairAddress, 
            token0: token0,
            token1: token1,
            symbol0: token0Symbol, 
            symbol1: token1Symbol,
            changeToken0: price0Open > price0Close ? `-${percDiff0}` : `+${percDiff0}`,
            changeToken1: price1Open > price1Close ? `-${percDiff1}` : `+${percDiff1}`,
            totalSupply0: supply0 / (10 ** decimal0),
            totalSupply1: supply1 / (10 ** decimal1),
            DEX: dex,
            network: network
        }
        callback(obj);
    }).catch(err=>{
        errorHandler({'file': 'app.js', 'function': 'aggregateChange', error: err});
    });
};