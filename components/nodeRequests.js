import Web3 from 'web3';
import Config from './config.js';
import errorHandler from '../errorHandler.js';

const {rpc_BSC, rpc_ETH, pairABI, tokenABI} = Config();


/**
 * @param {string} network
 * @returns timastamp of latest block in the node
 */
export async function LastBlockTime(network){
    const rpc = network == 'BSC' ? rpc_BSC : rpc_ETH;
    const web3 = new Web3(rpc);
    try{
        const number = await web3.eth.getBlockNumber();
        const block = await web3.eth.getBlock(number);

        return block.timestamp;
    } catch(err){
        errorHandler({'file': 'nodeRequests.js', 'function': 'LastBlockTime', error: err});
        return false;
    };
};



/**
 * 
 * @param {string} tokenAddress
 * @param {string} network
 * @returns token decimal
 */
export async function getDecimals(address, network){
    const rpc = network == 'BSC' ? rpc_BSC : rpc_ETH;
    const web3 = new Web3(rpc);
    try{
        const contract = new web3.eth.Contract(pairABI, address);
        const decimals = await contract.methods.decimals().call();
        return decimals;
    } catch(err){
        errorHandler({'file': 'nodeRequests.js', 'function': 'getDecimals', error: err});
    };
};




/**
 * 
 * @param {string} tokenAddress
 * @param {string} network
 * @returns token name
 */
export async function getName(address, network){
    const rpc = network == 'BSC' ? rpc_BSC : rpc_ETH;
    const web3 = new Web3(rpc);
    try{
        const contract = new web3.eth.Contract(pairABI, address);
        const name = await contract.methods.name().call();
        return resolve(name);
    } catch(err){
        resolve();
        return errorHandler({'file': 'nodeRequests.js', 'function': 'getName', error: err});
    };
};



/**
 * 
 * @param {string} tokenAddress
 * @param {string} network
 * @returns token supply
 */
export async function getSupply(address, network){
    const rpc = network == 'BSC' ? rpc_BSC : rpc_ETH;
    const web3 = new Web3(rpc);
    try{
        const contract = new web3.eth.Contract(tokenABI, address);
        const supply = await contract.methods.totalSupply().call();
        return supply;
    } catch(err){
        return errorHandler({'file': 'nodeRequests.js', 'function': 'getSupply', error: err});
    };
};



/**
 * 
 * @param {string} tokenAddress
 * @param {string} network
 * @returns token symbol
 */
export async function getSymbol(address, network){
    const rpc = network == 'BSC' ? rpc_BSC : rpc_ETH;
    const web3 = new Web3(rpc);
    try{
        const contract = new web3.eth.Contract(tokenABI, address);
        const symbol = await contract.methods.symbol().call();
        return symbol;
    } catch(err){
        return errorHandler({'file': 'nodeRequests.js', 'function': 'getSymbol', error: err});
    };
};


/**
 * 
 * @param {string} pairAddress
 * @param {string} network
 * @returns token token0 & token1 address from pair contract
 */
 export async function getTokenAddress(address, network){
    const rpc = network == 'BSC' ? rpc_BSC : rpc_ETH;
    const web3 = new Web3(rpc);
    try{
        const contract = new web3.eth.Contract(pairABI, address);
        const token0 = await contract.methods.token0().call();
        const token1 = await contract.methods.token1().call();
        return {token0: token0, token1: token1};
    } catch(err){
        return errorHandler({'file': 'nodeRequests.js', 'function': 'Get token address', error: err});
    };
};


/**
 * 
 * @param {number} blockNumber transaction
 * @param {string} network
 * @returns timestamp
 */
 export async function getTimestamp(blockNumber, network){
    const rpc = network == 'BSC' ? rpc_BSC : rpc_ETH;
    const web3 = new Web3(rpc);
    try{
        const block = await web3.eth.getBlock(blockNumber);
        return block.timestamp;
    } catch(err){
        return errorHandler({'file': 'nodeRequests.js', 'function': 'Get token address', error: err});
    };
};