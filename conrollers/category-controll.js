const category = require('../models/catogory-model')
// const product = require('../models/productmodel')
const User = require("../models/user-models");

const uc = require('upper-case')


//listing category
const categoryList = async (req,res)=>{
    try {
        const adminData = await User.findById({ _id: req.session.Auser_id });
        const catData = await category.find({is_delete:false})
        res.render('category-list',{category:catData,admin:adminData})
    } catch (error) {
       console.log(error.message); 
    }
}

 //  updating and saving the catagory 
const  saveCatogary= async (req,res)=>{
    try {
        const name = uc.upperCase(req.body.categorynames);
       const catDATA = await category.findOneAndUpdate({_id:req.query.id},{$set:{categoryname:name}});
       if(catDATA){
        res.redirect('/admin/category-list')
       }
    } catch (error) {
        console.log(error.message);
    }
}



//  Adding the catagory
const insertCategory = async (req,res)=>{
    try
     {
        if(req.session.Auser_id){
          
            const catName = uc.upperCase(req.body.categoryname);
             const Category = new category({
                categoryname:catName
            })
            if(catName.trim().length==0){
                const catagoryDatas = await category.find({is_delete:false})
                const adminData = await User.findById({ _id: req.session.Auser_id });
                res.render('category-list',{message:"Invalid typing",admin:adminData, category:catagoryDatas});
            }else{
                const catData = await category.findOne({categoryname:catName});
                await category.updateOne({categoryname:catName},{$set:{is_delete:false}});
            
                if(catData){
                    const adminData = await User.findById({ _id: req.session.Auser_id });
                     const catagoryDatas = await category.find({is_delete:false})
                    res.render('category-list',{message:"This category is already exist",admin:adminData,category:catagoryDatas});
                }else{
                    const categoryData = await Category.save();
                    if(categoryData){
                        const catagoryDatas = await category.find({is_delete:false})
                        const adminData = await User.findById({ _id: req.session.Auser_id });
                        res.render('category-list',{admin:adminData, category:catagoryDatas});
                    }else{
                        res.redirect('/admin/dashboard');
                    }
                }
            }
        }else{
            res.redirect('/admin')
        }
    } catch (error) {
        console.log(error.message);
    }
 }

//  delete the catagory 
 const deletecategory = async (req,res)=>{
    try {
       const id = req.query.id   
       await category.updateOne({_id:id},{$set:{is_delete:true}})
       res.redirect('/admin/category-list')
    }
     catch (error) {
        console.log(error.message);
    }
}

//  Editing the catagory 
const  editCatogary= async (req,res)=>{
    try {
        const id = req.query.id;
       const catDATA = await category.findById({_id:id});
       const adminData = await User.findById({ _id: req.session.Auser_id });
       res.render('edit-category',{category:catDATA , admin:adminData})
    } catch (error) {
        console.log(error.message);
    }
}



module.exports={
    categoryList,
    saveCatogary,
    insertCategory,
    deletecategory,
    editCatogary
}