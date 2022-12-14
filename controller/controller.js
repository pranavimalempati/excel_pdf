const { db } = require("../db");
const ages = db.collection("Age");
const excelJs = require("exceljs");
const PDFDocument = require("pdfkit");
const mongoose = require('mongoose');
const fs = require('fs')

// inserting the excel data with conditions
const fileupload = async(req,res)=>{
  const session = await mongoose.startSession();
  try {
    session.startTransaction()
    const data = []
    const errormsg = []
    let temp =[]
    const workbook = new excelJs.Workbook();
     const result = await workbook.xlsx.readFile(req.file.path);
      const rCount = workbook.worksheets[0].actualRowCount;
      // console.log(rCount);
      const rowcount = workbook.worksheets[0].rowCount;
      console.log(rowcount);
      const columnCount = workbook.worksheets[0].columnCount
      // console.log(columnCount)
      if(rCount > 1 && columnCount == 2){
      let resp = validateHeaders(workbook.worksheets[0].getRow(1).values)
      console.log(resp.status);
      if(resp.status =='ERROR') {
        errormsg.push({location: resp.location, message: resp.message})
       console.log(errormsg)
      }else{
       for(let i = 2;i<=rCount;i++) {
       const name = workbook.worksheets[0].getRow(i).values[1];
       const age = workbook.worksheets[0].getRow(i).values[2];
      //  console.log(name)
      //  console.log(age);
       if((name == undefined && age != undefined) || (name!= undefined && age == undefined)){
        errormsg.push({message:`onefield can not be empty`,location: "Row" + index,})
        console.log(errormsg)
        break;
       }else if(nameCheckLetters(name) && ageCheckNum(age) ){
        let data1 = {
          Name: name,
          Age: age,
        };
        data.push(data1)
        console.log(data)
       }else{
        var validatetxt =  `file rejected 
                    file validations:
                name should have only letter,
                age should contain only number`
        errormsg.push({message:validatetxt})
        console.log(errormsg)
        break;
       }
      }
    }   
    }else{
      errormsg.push({message: `file rejected 
      file validations:
      we need to have only two columns,
      excel sheet should not be empty`})
      console.log(errormsg)
    }
    if(errormsg){
      console.log("file rejected")
    }else{
    const record = await ages.insertMany(data);
        console.log(record)
        await session.commitTransaction();
        session.endSession();
    }
      
  } catch (error) {
    await session.abortTransaction();
     session.endSession();
    res.send(error.message);
    console.log(error.message);
  }
  
}
function nameCheckLetters(str) {
  return /^[a-zA-Z]+$/.test(str);
}

function ageCheckNum(str) {
  return /^[0-9]+$/.test(str);
}

function validateHeaders(headerRow) {
  console.log(headerRow)
  if(headerRow[1]!=='Name' || headerRow[2]!=='Age') {
      return {status: 'ERROR', location: "ROW 1", message: 'Incorrect Header.'}
  }
  else {
      return {status: 'SUCCESS'}
  }
}

// calculating the count & averageage ,downloading that data in pdf format
const download = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction()
  try {
    const resp =  await ages.find().toArray(); 
    const count = resp.length
  let sum = 0;
  for (let index = 0; index < resp.length; index++) {
  sum+= resp[index].Age
  }
    const avg =parseInt(sum/count);
    console.log(avg)
    const pdfElement = {
      Count: count,
      averageAge: avg,
    };
    // Create a document
    const doc = new PDFDocument();
    doc.pipe(fs.createWriteStream("./uploads/output.pdf"));

    // Embed a font, set the font size, and render some text
    doc.fontSize(25).text(`totalrecords:${count}, average:${avg}`, 90, 90);
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


module.exports = {fileupload ,download}
