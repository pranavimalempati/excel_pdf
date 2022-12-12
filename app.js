const express = require("express")
const app = express();
const bodyParser = require("body-parser")
const mongoose = require("mongoose")
const cors = require('cors');
require('dotenv').config()
const router = require("./router/router")
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json())
app.use(cors())
async function run() {
    await mongoose.connect("mongodb://localhost:27017");
    app.use("/",router)
    app.listen(process.env.PORT, () => {    
        console.log(`Now listening on port ${process.env.PORT}`); 
    });
}
run();


