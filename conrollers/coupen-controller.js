const User = require("../models/user-models");
const Coupen = require('../models/coupen-model')
const Product = require('../models/product-model')

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

//applying coupen in user side

const applyCoupen = async(req,res,next)=>{
    try {
      const code = req.body.code;
      const amount = Number(req.body.amount)
      console.log(amount+"=="+code);
      const userExist = await Coupen.findOne({code:code,user:{$in:[req.session.user_id]}})
      if(userExist){
        res.json({user:true})
      }else{
        const coupendata = await Coupen.findOne({code:code})
        if(coupendata){
            if(coupendata.expiryDate <= new Date()){
                res.json({date:true})
            }else{
                await Coupen.findOneAndUpdate({_id:coupendata._id},{$push:{user:req.session.user_id}}) 
                const perAmount = Math.round((amount * coupendata.discountPercentage)/100 )
                const disTotal =Math.round(amount - perAmount)
                console.log(disTotal+"==="+perAmount);
                return res.json({amountOkey:true,disAmount:perAmount,disTotal})
            }
        }
      }
      res.json({invalid:true})
    } catch (error) {
        console.log(error.message);
    }
}

//add offer to product

const addOffer = async(req,res,next)=>{
    try {
        const proId = req.body.proId
        const percentage = req.body.percentage
        const name = req.body.name
        const updateProduct = await Product.findOneAndUpdate(
            { _id: proId },
            {
              $set: {
                discountName: name,
                discountPercentage: percentage
              }
            },
            { new: true }
          );  
         res.redirect("/admin/products-list");  

    } catch (error) {
        
    }
}

module.exports = {
    loadCoupenController,
    insertCoupen,
    updateCoupen,
    deleteCoupen,
    applyCoupen,
    addOffer
}