const User = require("../models/user-models");
const category = require("../models/catogory-model");
const Product = require("../models/product-model");
const path = require('path')
const fs = require('fs')

//insert product in admin panel

const insertProducts = async (req, res) => {
  try {
    
    const catData = await category.find();
    const adminData = await User.findById({ _id: req.session.Auser_id });


    const images = [];
    if (req.files && req.files.length > 0) {
      for (let i = 0; i < req.files.length; i++) {
        images[i] = req.files[i].filename;
      }
    }

    //--product quantity and price checking--//

    if(req.body.quantity < 0 ||  req.body.price < 0 ){
     return res.render("add-product", { admin: adminData, category: catData  ,message:'negetive not allowed'});
    }

    //white spsce checking
    if (
      req.body.productname.trim() === "" ||
      req.body.description.trim() === "" ||
      req.body.quantity.trim() === "" ||
      req.body.price.trim() === ""
    ) {
      return res.render("add-product", { admin: adminData, category: catData  ,message:'All field are required'})
    }


    const product = new Product({
      productname: req.body.productname.trim(),
      brand: req.body.brand,
      size: req.body.size,
      category: req.body.category,
      description: req.body.description.trim(),
      quantity: req.body.quantity.trim(),
      image: images,
      price: req.body.price.trim(),
    });

    console.log(product);
    const productData = await product.save();

    if (productData) {
      return res.redirect("/admin/add-product");
    } else {
      return res.redirect("/admin/add-product");
    }
  } catch (error) {
    console.log(error.message);
  }
};

//loading products

const loadProducts = async (req, res) => {
  try {
    const productDatas = await Product.find({is_delete:false});
    const adminData = await User.findById({ _id: req.session.Auser_id });
    res.render("products-list", { admin: adminData, product: productDatas });
  } catch (error) {
    console.log(error.message);
  }
};

//add product in admin panel

const addProducts = async (req, res) => {
  try {
    const catData = await category.find({});
    const adminData = await User.findById({ _id: req.session.Auser_id });
    res.render("add-product", { admin: adminData, category: catData });
  } catch (error) {
    console.log(error.message);
  }
};

//delete product in admin panel

const deleteProduct = async (req, res) => {
  try {
    const id = req.query.id;
    await Product.updateOne({ _id: id },{$set:{is_delete:true}});
    res.redirect("/admin/products-list");
  } catch (error) {
    console.log(error.message);
  }
};

//edit product in product list

const editProduct = async (req, res) => {
  try {
    const id = req.params.id;
    const productDATA = await Product.findById(id).populate('category');
    const adminData = await User.findById(req.session.Auser_id);
    const catData = await category.find({ is_delete: false });

    if (productDATA) {
      res.render("edit-product", {
        admin: adminData,
        product: productDATA,
        category: catData
      });
    } else {
      res.redirect("/admin/product-list");
    }
  } catch (error) {
    console.log(error.message);
  }
};

//remove images in product list

const removeImg = async (req, res) => {
  try {
    const imgid = req.params.imgid;
    const prodid = req.params.prodid;

    fs.unlink(path.join(__dirname, "../public/adminAssets/adminImages", imgid), () => {});

    await Product.findByIdAndUpdate(prodid, { $pull: { image: imgid } });

    res.redirect(`/admin/edit-product/${prodid}`);
  } catch (error) {
    console.log(error.message);
  }
};

//for saving edited data in product

const saveProduct = async (req, res) => {
    try {
      const id = req.params.id;
      const productData = await Product.findById(id).populate('category');
      const categoryData = await category.find();
      const adminData = await User.findById(req.session.Auser_id);

      //white space checking

      if (req.body.productname.trim() === ""|| req.body.discountname.trim() === ""   || req.body.description.trim() === "" || req.body.quantity.trim() === "" || req.body.price.trim() === "") 
      {
       return res.render("edit-product", {
          admin: adminData,
          product: productData,
          message: "All fields required",
          category: categoryData
        });
      }

       //--product quantity and price checking and product discount percentage chekking--//

     if(req.body.quantity < 0 ||  req.body.price < 0  || req.body.percentage < 0 ){
      return res.render("edit-product", { product: productData, admin: adminData, category: categoryData  ,message:'negetive not allowed'});
     }else if(req.body.percentage >= 80 ){
      return res.render("edit-product", { product: productData, admin: adminData, category: categoryData  ,message:'maximum discount is 80 !!!'});
     }

     const images = req.files.map(file => file.filename);

     await Product.findByIdAndUpdate(id, {
       productname: req.body.productname,
       brand: req.body.brand,
       price: req.body.price,
       category: req.body.category,
       quantity: req.body.quantity,
       description: req.body.description,
       discountPercentage:req.body.percentage,
       discountName:req.body.discountname,
       $addToSet: { image: { $each: images } }
     });

     res.redirect('/admin/products-list');

    } catch (error) {
      console.log(error.message);
    }
  }


//for update images in edit

const updateimage = async (req, res) => {
  try {
    const id = req.params.id;
    const productData = await Product.findById(id);
    const imgLength = productData.image.length;
    const images = req.files.map(file => file.filename);

    if (imgLength + images.length <= 10) {
      await Product.findByIdAndUpdate(id, { $addToSet: { image: { $each: images } } });
    }

    res.redirect(`/admin/edit-product/${id}`);
  } catch (error) {
    console.log(error.message);
  }
};


module.exports = {

  insertProducts,
  loadProducts,
  addProducts,
  deleteProduct,
  editProduct,
  saveProduct,
  removeImg,
  updateimage

};
