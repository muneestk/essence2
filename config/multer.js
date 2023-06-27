const multer = require ('multer')
const path = require ('path')

const storage = multer.diskStorage({
    destination: function(req,file,cb){
        cb(null,path.join(__dirname,'../public/adminAssets/adminImages'))
    },
    filename : function(req,file,cb){
        const name = Date.now()+'-'+file.originalname;
        cb(null,name)
    }
})

const imagefilter = function (req, file, cb) {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Invalid file format. Please upload an image.'), false);
    }
    cb(null, true);
  }
  

  

  const upload = multer({ storage: storage, fileFilter: imagefilter })


module.exports ={
    upload,

}