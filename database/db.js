import { set, connect } from 'mongoose';
const env = process.env.NODE_ENV || 'development';
const config = require(`${__dirname}/../config/config.json`)[env] ;

set("strictQuery", false);
connect(config.url,{
    user: config.username,
    pass: config.password,
    dbName: config.database
}).then(() => {
    console.log('database connected!');
}).catch((e) => {
    console.log(e)
});