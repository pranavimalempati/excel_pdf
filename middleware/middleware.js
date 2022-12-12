const multer = require('multer');


const storage = multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null,'uploads');
    },
    filename:(req,file,cb)=>{
        cb(null, `${file.originalname}`)
    }
});

const fileFilter = (req,file,cb)=>{
    console.log(file.mimetype)
    if (file.mimetype == "application/vnd.ms-excel" || file.mimetype == "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") {
        cb(null,true);
    }else{
        cb(null,false);
    }
}

const upload = multer({storage:storage, fileFilter:fileFilter})


module.exports = {upload}