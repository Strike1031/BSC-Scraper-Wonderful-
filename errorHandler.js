import fs from 'fs';
import util from 'util';


const date = new Date();

export default function errorHandler(err){
    // console.log(err)
    fs.appendFile('./errorReport.txt', `${date}: - ${util.format(err)}\r\n ---- \r\n`, (error)=>{
        if(error) return;
    });
};