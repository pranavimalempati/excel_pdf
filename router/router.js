const controller = require("../controller/controller");
const {upload} = require ('../middleware/middleware');
const router = require("express").Router();

router.post('/upload', upload.single('excel'),controller.fileupload)
router.get('/download', controller.download)



module.exports = router;