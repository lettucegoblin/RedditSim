const { MongoClient, ObjectId  } = require('mongodb');

const url = process.env.MONGO_URI;
const DB_Name = process.env.MONGO_DB_NAME;
console.log("DB_Name",url, DB_Name);

const client = new MongoClient(url);

async function connect() {
    const db = await client.connect();
    //console.log(url);
    return db.db(DB_Name);
}

module.exports = {
    connect, ObjectId, DB_Name
}