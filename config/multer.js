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

const imagefilter = function(req,file,cb){
    if(!file.originalname.match(/\.(jpg|jpeg|png|webp)$/)){
        req.fileCalidationerror = 'only images files are allowed!'
        return cb(new Error('only images files are allowed!'),false)
    }
    cb(null,true)
}

const upload = multer({storage:storage,imagefilter})


module.exports ={
    upload,

}