const { MongoClient, ServerApiVersion } = require("mongodb");

const client = new MongoClient("mongodb://localhost:27017", {
    compressors: ["snappy","zlib","zstd"],
    retryWrites: true,
    writeConcern: "majority"
});

let db = client.db('mongo');

module.exports={db}

