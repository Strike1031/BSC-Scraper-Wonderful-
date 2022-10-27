import factoryABI from './ABI/factoryABI.js';
import tokenABI from './ABI/tokenABI.js';
import pairABI from './ABI/pairABI.js';
import routerABI from './ABI/routerABI.js';

import * as dotenv from "dotenv";
dotenv.config();

const data = {
    localDatabase: process.env.LOCAL_DATABASE,
    database_BSC: process.env.DATABASE_BSC,
    database_ETH: process.env.DATABASE_ETH,
    rpc_BSC: process.env.RPC_BSC,
    socket_BSC: process.env.SOCKET_BSC,
    rpc_ETH: process.env.RPC_ETH,
    socket_ETH: process.env.SOCKET_ETH,
    tokenABI: tokenABI(),
    pairABI: pairABI(),
    factoryABI: factoryABI(),
    routerABI: routerABI(),
    BSC_PCS_V1: '0x05fF2B0DB69458A0750badebc4f9e13aDd608C7F', // BSC PancakeSwap V1
    BSC_PCS_V2: '0x10ED43C718714eb63d5aA57B78B54704E256024E', // BSC PancakeSwap V2
    ETH_UNI_V2: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D', // ETH UniSwap V2
    ETH_UNI_V3: '0xE592427A0AEce92De3Edee1F18E0157C05861564', // ETH UniSwap V3
    webhook: process.env.WEBHOOK,
    discord_server: process.env.DISCORD_SERVER,
    discord_token: process.env.DISCORD_TOKEN,
    discord_channel_id: process.env.DISCORD_CHANNEL_ID,
};

export default function Config(){
    return data;
};