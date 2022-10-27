import mongoose from 'mongoose';
import Config from '../../components/config.js';


const {database_BSC} = Config();
const db = mongoose.createConnection(database_BSC);
const TransactionsBSC = db.useDb('BSC'); // each network gets its own database


const txSchema = new mongoose.Schema({
    uniquePoint:{
        type: String,
        required: true,
        index: true,
        unique : true,
    },
    pairAddress: {
        type: String,
        required: true,
    },
    token0: {
        type: String,
        required: true,
    },
    token1: {
        type: String,
        required: true,
    },
    symbol0: {
        type: String,
        required: true,
    },
    symbol1: {
        type: String,
        required: true,
    },
    reserves0: {
        type: String,
        required: true,
    },
    reserves1: {
        type: String,
        required: true,
    },
    token0Amount: {
        type: String,
        required: true,
    },
    token1Amount: {
        type: String,
        required: true,
    },
    transactionhash: {
        type: String,
        required: true,
    },
    timestamp: {
        type: Number,
        required: true,
    },
    amount0In: {
        type: String,
        required: true,
    },
    amount1In: {
        type: String,
        required: true,
    },
    amount0Out: {
        type: String,
        required: true,
    },
    amount1Out: {
        type: String,
        required: true,
    },
    createdAt: { 
        type: Date, 
        expires: 86400,
        default: Date.now,
    },
    DEX:{
        type: String,
    },
    network:{
        type: String
    },
},{collection: 'PCS'}); // each swap gets its own collection

export default TransactionsBSC.model('TX', txSchema);