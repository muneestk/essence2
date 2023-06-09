const { ObjectId } = require('mongodb')
const mongoose = require('mongoose')

const addressSchema = new mongoose.Schema({
    userId:{
        type:ObjectId,
        required:true
    },
    addresses:[{
        username:{
            type:String,
            required:true
        },
        mobile:{
            type:String,
            required:true
        },
        housename: {
            type: String,
            required: true
         },
        landmark: {
            type: String,
            required: true
         },
         city: {
            type: String,
            required: true
         },
         state: {
            type: String,
            required: true
         },
         pincode: {
            type: Number,
            required: true
         },
        
    }]
})

module.exports = mongoose.model('address',addressSchema)