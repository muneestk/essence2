const User = require("../models/user-models");
const Coupen = require('../models/coupen-model')

//load coupen list in admin page 

const loadCoupenController = async(req,res,next)=>{
    try {
        const adminData = await User.findById({ _id: req.session.Auser_id });
        const coupenData = await Coupen.find()
        res.render('coupen-list',{admin:adminData,coupen:coupenData})
    } catch (error) {
        console.log(error.message);
    }
} 

//insert coupen

const insertCoupen = async(req,res,next) =>{
    try {
        const coupen = new Coupen({
            code:req.body.code.trim(),
            discountType:req.body.discount.trim(),
            startDate:req.body.startdate,
            expiryDate:req.body.expirydate,
            discountPercentage:req.body.percentage.trim(),
        })

        const coupenData = await coupen.save()
        if(coupenData){
            res.redirect('/admin/coupen-list')
        }else{
            message='something error'
            res.redirect('/admin/coupen-list')
        }    
    } catch (error) {
        console.log(error.message);
    }
}

//update coupen

const updateCoupen = async(req,res,next)=>{
    try {
        const id = req.params.id
        console.log(id);
        const updateCoupen = await Coupen.findOneAndUpdate({_id:id},{
            $set:{
                code:req.body.code.trim(),
                discountType:req.body.discount.trim(),
                startDate:req.body.startdate,
                expiryDate:req.body.expirydate,
                discountPercentage:req.body.percentage.trim(),
            }
        })
        if(updateCoupen){
            res.redirect('/admin/coupen-list')
        }else{
            message='something error'
            res.redirect('/admin/coupen-list')
        }
    } catch (error) {
        console.log(error.message);
    }
}

//delete coupen

const deleteCoupen = async(req,res,next) =>{
    try {
        const id = req.body.id
        const deleteCoupen = await Coupen.deleteOne({_id:id})
        if(deleteCoupen){
            res.json({success:true}) 
        }else{
            res.json({success:false})
        }
    } catch (error) {
        console.log(error.message);
    }
}








module.exports = {
    loadCoupenController,
    insertCoupen,
    updateCoupen,
    deleteCoupen
}