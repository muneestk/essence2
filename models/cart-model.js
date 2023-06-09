
const mongoose = require('mongoose')

const cartSchema = mongoose.Schema({
    userId:{
        type:String,
        required:true,
        ref:"user",
    },
    username:{
        type:String,
        required:true,
    },
    products: [{
       productid:{
           type:String,
           required:true,
           ref:'Product'
       },
       count:{
           type:Number,
           default:1
       },
       productPrice:{
         type:Number,
         required:true
       },
       totalPrice:{
          type:Number,
          required:true,
       }
    }]
})

module.exports = mongoose.model('cart',cartSchema)