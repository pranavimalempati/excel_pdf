const { db } = require("../db");
const record = db.collection("Age");
const excelJs = require("exceljs");
const PDFDocument = require("pdfkit");
const mongoose = require('mongoose');
const fs = require('fs')

// inserting the excel data with conditions
const fileupload = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction()
    try {
            let data = [];
            const workbook = new excelJs.Workbook();
           const result = await workbook.xlsx.readFile(req.file.path);
            workbook.eachSheet(function (workSheet) {
              if(workSheet.columnCount == 2 ){
              workSheet.eachRow(function (row) {
                if (nameCheckLetters(row.values[1]) && ageCheckNum(row.values[2]) && (row.values[1]!= ''&& row.values[2]!='' || row.values[1]==''&& row.values[2]== '')) {
                let data1 = {
                  name: row.values[1],
                  age: parseInt(row.values[2]),
                };
                data.push(data1);
                console.log(data1);
              data.shift();
            
            }else{
                 var validatetxt =  `file rejected 
                        file validations:
                         name should have only letter,
              age should contain only number and 
        2 feild should be either null or values`
                res.send({Status:"failed...",message:validatetxt})
            }
        });
          }else{
            res.send({Status:"reject",message:`file rejected 
                        file validations:
                        we need to have only two columns`})
          }
        })
             console.log(data);
             // //Db Insertion
            const resp = await record.insertMany(data);
            await session.commitTransaction();
            session.endSession();

            res.status(200).json({
                status : "success",
                response:resp,
                message:"sucessfully uploaded"});
   
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
      console.log(error.message);
      res.status(400).json({
        status : "failed...",
        message:error.message});
    }
  };

// calculating the count & averageage ,downloading that data in pdf format
const download = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction()
    try {
      const resp =  await record.find().toArray(); 
      const count = resp.length
    let sum = 0;
    for (let index = 0; index < resp.length; index++) {
    sum+= resp[index].age
    }
      const avg = sum/count;
      const pdfElement = {
        Count: count,
        averageAge: avg,
      };
      // Create a document
      const doc = new PDFDocument();
      doc.pipe(fs.createWriteStream("./uploads/output.pdf"));

      // Embed a font, set the font size, and render some text
      doc.fontSize(25).text(`totalrecords:${count}, average:${sum / count}`, 90, 90);
      doc.end();
      await session.commitTransaction();
      session.endSession();
    
      res.send({pdfElement})
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        res.send(error.message)
    }
}

function nameCheckLetters(str) {
    return /^[a-zA-Z]+$/.test(str);
  }
  
  function ageCheckNum(str) {
    return /^[0-9]+$/.test(str);
  }
  
module.exports = { download , fileupload}