import Web3 from 'web3';
import Config from './components/config.js';
import ProcessSwap from './components/processSwap.js';
import errorHandler from './errorHandler.js';
import {LastBlockTime, getTimestamp} from './components/nodeRequests.js';


const {socket_ETH, rpc_ETH, ETH_UNI_V2, ETH_UNI_V3} = Config();

const web3Socket1 = new Web3(socket_ETH);
const web3 = new Web3(rpc_ETH);
const Router1 = web3.eth.abi.encodeParameter('address', ETH_UNI_V2); // PancakeSwap Router address V1
const Router2 = web3.eth.abi.encodeParameter('address', ETH_UNI_V3); // PancakeSwap Router address V2
const swapEvent = web3.utils.sha3('Swap(address,uint256,uint256,uint256,uint256,address)'); // pancakeswap swap event
const syncEvent = web3.utils.sha3('Sync(uint112,uint112)'); // pancakeswap sync event
const maxPast = Math.round((Date.now() / 1000) - 86400); // current timestamp - 24 hours


let sync = {},
    start = true,
    startBlock = 22193937,
    sendError = false,
    promiseSequence = Promise.resolve();


// start live scraper
live();



/**
 * 
 *  On start/restart go from current block back 24 hours to check all swpas
 *  
 */
async function history(){
    const currentTime = await getTimestamp(startBlock, 'ETH');
    if(currentTime < maxPast) return;

    web3.eth.getPastLogs({
        fromBlock: startBlock,
        toBlock: startBlock,
        topics: [
            [swapEvent, syncEvent]
        ]
    }).then((logData)=>{
        logData.map((item, i)=>{
            const {topics} = item;
            if(topics[0] == swapEvent){

                if(topics[1] == Router1 || topics[1] == Router2) {

                    const decoded = web3.eth.abi.decodeParameters(['uint112','uint112'], logData[i-1].data);
                    sync = {
                        reserve0: decoded[0], 
                        reserve1: decoded[1]
                    };

                    promiseSequence = [promiseSequence, processHistory(item, sync)];
                };
                
            };
            
            if(i == (logData.length - 1)){
                startBlock = startBlock - 1;
                Promise.all(promiseSequence).then(()=>{
                    
                }).finally(()=>{
                    return history();
                });
            };

        });
    }).catch((err)=>{
        errorHandler({'file': 'scraper-ETH.js', 'function': 'history', error: err});
    });
};


function processHistory(item, sync){
    return new Promise(resolve => {
        ProcessSwap(item, sync, 'ETH', 'UNI', true, ()=>{
            resolve();
        });
    });
};


/**
 * 
 *  Listen to socket logs from the ETH node
 *  
 */
function live(){
    console.log('Live Scraper ETH started')
    const subscription = web3Socket1.eth.subscribe('logs', {
        topics: [
            [swapEvent, syncEvent]
        ]
    }).on('data', (logData)=>{
        const {topics, logIndex, data, transactionHash, blockNumber} = logData;

        if(start){
            start = false;
            startBlock = blockNumber;
            history();
            console.log('History scraper ETH started')
        };

        if(topics[0] == syncEvent){
            const decoded = web3.eth.abi.decodeParameters(['uint112','uint112'], data);
            sync = {
                transactionHash: transactionHash, 
                logIndex: logIndex, 
                reserve0: decoded[0], 
                reserve1: decoded[1]
            };
        } else if(topics[0] == swapEvent){
            if(topics[1] != Router1 && topics[1] != Router2) return;
            if(sync.logIndex == (logIndex-1)){
                ProcessSwap(logData, sync, 'ETH', 'UNI');
            } else {
                errorHandler({'file': 'scraper-ETH.js', 'function': 'live', error: 'Missing sync log'});
                // get sync log and send to ProcessSwap()
            };
        };
    }).on('error', (err)=>{
        console.log(err)
        subscription.unsubscribe((err, success)=>{
            if(err){
                // live();
                return errorHandler({'file': 'scraper-ETH.js', 'function': 'live', error: err});
            };
        });
        //  live();
        return errorHandler({'file': 'scraper-ETH.js', 'function': 'live', error: err});
    });
};



/**
 * check timestamp of latest block every 30 seconds
 */
 setInterval(async()=>{
    try{
        const blockTime = await LastBlockTime('ETH');
        const maxDelay = 60; // if latest block is older then 1 minute
        const currentTime = parseInt((Date.now()/1000).toFixed(0));
        const diff = currentTime - blockTime;

        if(diff > maxDelay || !blockTime){

            if(sendError) return;

            sendError = true;

            // send notification
            console.log('Node Error ETH')

            setInterval(()=>{
                sendError = false;
            }, 1800);
        };
    } catch(err){
        errorHandler({'file': 'scraper-ETH.js', 'function': 'setInterval', error: err});
    };
}, 30000);