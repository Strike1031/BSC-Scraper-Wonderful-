import TransactionsBSC from '../models/BSC/tx_PCS.js';
import TransactionsETH from '../models/ETH/tx_UNI.js';
import errorHandler from '../errorHandler.js';


export function saveTX(data, network, callback){
    const tx = network == 'BSC' ? TransactionsBSC : TransactionsETH; // only detect network not swap yet
    try{
        const newTX = new tx(data);
        newTX.save((err)=>{
            if(err){
                if(err.code == 11000) return callback(); // We can not save double transaction, dismiss error for duplicate
                callback();
                errorHandler({'file': 'txController.js', 'function': 'saveTX', error: err});
                return console.log(err, data.pairAddress);
            };
            return callback();
        });
    } catch(err){
        return errorHandler({'file': 'txController.js', 'function': 'saveTX', error: err});
    };
};