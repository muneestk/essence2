const Cart = require("../models/cart-model");
const User = require("../models/user-models");
const Product = require("../models/product-model");
const Address = require("../models/address-model");
const Coupen = require('../models/coupen-model')
const { json } = require("express");

// // Load cart page

const loadCart = async (req, res) => {
  try {
    const session = req.session.user_id
    let userName = await User.findOne({ _id: req.session.user_id });
    let cartData = await Cart.findOne({ userId: req.session.user_id }).populate(
      "products.productid"
    );
    if (req.session.user_id) {
      if (cartData) {
        if (cartData.products.length > 0) {
          const products = cartData.products;
          const total = await Cart.aggregate([
            { $match: { userId: req.session.user_id } },
            { $unwind: "$products" },
            {
              $group: {
                _id: null,
                total: { $sum: { $multiply: ["$products.productPrice", "$products.count"] } },
              },
            },
          ]);
        

          const Total = total.length > 0 ? total[0].total : 0; 
          const userId = userName._id;
          res.render("cart-page", { products: products, Total: Total, userId ,session});
        } else {
          res.render("empty-cart-page", {
            userName,
            session,
            message: "No Products Added to cart !",
          });
          return
        }
      } else {
        res.render("empty-cart-page", {
          userName,
          session,
          message: "No Products Added to cart",
        });
        return
      }
    } else {
      res.redirect("/login");
    }
  } catch (error) {
    console.log(error.message);
  }
};





// Add a product to the cart




const addToCart = async (req, res) => {
  try {
    const userId = req.session.user_id;
    const userData = await User.findOne({ _id: userId });
    const productId = req.body.id;
    const productData = await Product.findOne({ _id: productId });

    const productQuantity = productData.quantity;

    const cartData = await Cart.findOneAndUpdate(
      { userId: userId },
      {
        $setOnInsert: {
          userId: userId,
          username: userData.name,
          products: [],
        },
      },
      { upsert: true, new: true }
    );

    const updatedProduct = cartData.products.find((product) => product.productid === productId);
    const updatedQuantity = updatedProduct ? updatedProduct.count : 0;

    if (updatedQuantity + 1 > productQuantity) {
      return res.json({
        success: false,
        message: "Quantity limit reached!",
      });
    }

    const cartProduct = cartData.products.find((product) => product.productid === productId);

    if (cartProduct) {
      await Cart.updateOne(
        { userId: userId, "products.productid": productId },
        {
          $inc: {
            "products.$.count": 1,
            "products.$.totalPrice": productData.price,
          },
        }
      );
    } else {
      cartData.products.push({
        productid: productId,
        productPrice: productData.price,
        totalPrice: productData.price,
      });
      await cartData.save();
    }

    res.json({ success: true });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};



//change product quantity in cart

const changeProductCount = async (req, res) => {
  try {
    const userData = req.session.user_id;
    const proId = req.body.product;
    let count = req.body.count;
    count = parseInt(count);
    const cartData = await Cart.findOne({ userId: userData });
    const product = cartData.products.find((product) => product.productid === proId);
    const productData = await Product.findOne({ _id: proId });
    
    const productQuantity = productData.quantity
    

    const updatedCartData = await Cart.findOne({ userId: userData });
    const updatedProduct = updatedCartData.products.find((product) => product.productid === proId);
    const updatedQuantity = updatedProduct.count;
    
    
    if (count > 0) {
      // Quantity is being increased
      if (updatedQuantity + count > productQuantity) {
        res.json({ success: false, message: 'Quantity limit reached!' });
        return;
      }
    } else if (count < 0) {
      // Quantity is being decreased
      if (updatedQuantity <= 1 || Math.abs(count) > updatedQuantity) {
        await Cart.updateOne(
          { userId: userData },
          { $pull: { products: { productid: proId } } }
        );
        res.json({ success: true });
        return;
      }
    }
    
    const cartdata = await Cart.updateOne(
      { userId: userData, "products.productid": proId },
      { $inc: { "products.$.count": count } }
    );
    
    const updateCartData = await Cart.findOne({ userId: userData });
    const updateProduct = updateCartData.products.find((product) => product.productid === proId);
    const updateQuantity = updateProduct.count;
    const price = updateQuantity * productData.price;
    
    await Cart.updateOne(
      { userId: userData, "products.productid": proId },
      { $set: { "products.$.totalPrice": price } }
    );
    
    res.json({ success: true });
    
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};



//delete Product from cart



const deleteCartProduct = async (req, res) => {
  try {
    const userData = req.session.user_id;
    const proId = req.body.product;
    const cartData = await Cart.findOne({ userId: userData });
    
    if (cartData.products.length === 1) {

      await Cart.deleteOne({ userId: userData });
    } else {
     
      await Cart.updateOne(
        { userId: userData },
        { $pull: { products: { productid: proId } } }
      );
    }

    res.json({ success: true });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

//loading empty checkout -page

const loademptyCheckout = async(req,res) =>{
  try {
    res.render('empty-checkout')
  } catch (error) {
    console.log(error.message);
  }
}

//loading checkoutpage

const loadChekout = async(req,res)=>{
  try {
    const session = req.session.user_id
    const userData = await User.findOne ({_id:req.session.user_id});
    const addressData = await Address.findOne({userId:req.session.user_id});
    const coupen = await Coupen.find()
   
    const total = await Cart.aggregate([
      { $match: { userId: req.session.user_id } },
      { $unwind: "$products" },
      {
        $group: {
          _id: null,
          total: { $sum: { $multiply: ["$products.productPrice", "$products.count"] } },
        },
      },
    ]);
    const Total = total.length > 0 ? total[0].total : 0; 
   

    if(req.session.user_id){
      if(addressData){
          if(addressData.addresses.length>0){
            const address = addressData.addresses
            
            res.render('checkout-page',{session,Total,address,user:userData,coupen})
          }
          else{
            res.render('empty-checkout',{session,Total})
          }
        }else{
          res.render('empty-checkout',{session,Total,totalAmount,coupen});
        }
      }else{
        res.redirect('/')
      }
  } catch (error) {
    console.log(error.message);
  }
}


module.exports = { 
                  loadCart,
                  addToCart,
                  changeProductCount ,
                  deleteCartProduct,
                  loadChekout,
                  loademptyCheckout
                
              };


