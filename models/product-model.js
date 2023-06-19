const mongoose = require('mongoose')

const product=mongoose.Schema({

    productname:{
        type:String,
        required:true
    },
    brand:{
        type:String,
        required:true
    },
    size:{
        type:String,
        required:true
    },
    category:{
        type:String,
        required:false
    },
    description:{
        type:String,
        required:true
    },
    quantity:{
        type:Number,
        required:true
    },
    image:{
       type:Array,
       required:true
    },
    price:{
        type:Number,
        required:true
    },
    is_delete:{
        type:Boolean,
        default:false
    },
    percentage:{
        type:Number,
    },
    discountPercentage:{
        type:Number,
    },
    discountName:{
        type:String,
    },


})

module.exports=mongoose.model('Product',product)