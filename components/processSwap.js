import Web3 from 'web3';
import {getTokenAddress, getDecimals, getSymbol, getTimestamp} from './nodeRequests.js'
import {saveTX} from '../controllers/txController.js';
import errorHandler from '../errorHandler.js';


const web3 = new Web3();


/**
 * 
 * @param {object} logData 
 * @param {object} sync 
 * @param {string} network // ETH - BSC
 * @param {number} dex // UNI - PCS
 * @returns  
 */
export default async function ProcessSwap(logData, sync, network, dex, history, callback){
    try{
        const {logIndex, blockNumber, transactionHash, data, address} = logData;
        const decoded = web3.eth.abi.decodeParameters(['uint256','uint256','uint256','uint256'], data);

        const timestamp = await getTimestamp(blockNumber, network);
        const tokens = await getTokenAddress(address, network);
        const token0 = tokens.token0;
        const token1 = tokens.token1;
        const token0Decimal = await getDecimals(token0, network);
        const token1Decimal = await getDecimals(token1, network);

        const token0Symbol = await getSymbol(token0, network);
        const token1Symbol = await getSymbol(token1, network);

        const in0 = decoded[0] < 1 ? true : false;

        const res0 = sync.reserve0;
        const res1 = sync.reserve1;

        const x = res0 / (10 ** token0Decimal);
        const y = res1 / (10 ** token1Decimal);

        const amountTX = {
            amount0In: decoded[0] / (10 ** token0Decimal),
            amount1In: decoded[1] / (10 ** token1Decimal),
            amount0Out: decoded[2] / (10 ** token0Decimal),
            amount1Out: decoded[3] / (10 ** token1Decimal),
        };

        const {amount0In, amount1In, amount0Out, amount1Out} = amountTX;

        const token0Amount = in0 ? amount0Out : amount0In; 
        const token1Amount = in0 ? amount1In : amount1Out; 

        const tx = {
            uniquePoint: transactionHash + '/' + blockNumber + '/' + logIndex,
            pairAddress: address,
            token0: token0,
            token1: token1,
            symbol0: token0Symbol,
            symbol1: token1Symbol,
            reserves0: x,
            reserves1: y,
            token0Amount: token0Amount,
            token1Amount: token1Amount,
            transactionhash: transactionHash,
            timestamp: timestamp,
            amount0In: amount0In,
            amount1In: amount1In,
            amount0Out: amount0Out,
            amount1Out: amount1Out,
            DEX: dex,
            network: network
        };

        if(address == '0x16b9a82891338f9bA80E2D6970FddA79D1eb0daE'){
            console.log(tx)
        }

        //It is saving function to the database
      /*  saveTX(tx, network, ()=>{
            if(history){
                return callback();
            };
            return;
        }); */
            
    } catch(err){
        return errorHandler({'file': 'processSwap.js', 'function': 'processSwap', error: err});
    };
};