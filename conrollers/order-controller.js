const Cart = require("../models/cart-model");
const User = require("../models/user-models");
const Product = require("../models/product-model");
const Order = require('../models/order-modal')
const razorpay = require('razorpay')

//instance creating for razorpay

  var instance = new razorpay({
    key_id:process.env.Razorpay_Key_Id,
    key_secret:process.env.Razorpay_Key_Secret,
  })

//place order

const placeOrder = async (req, res) => {
  try {
    const userData = await User.findOne({ _id: req.session.user_id });
    const address = req.body.address;
    const cartData = await Cart.findOne({ userId: req.session.user_id });
    const products = cartData.products;
    const total = parseInt(req.body.Total);
    const paymentMethod = req.body.payment;

    const status = paymentMethod === 'COD' ? 'placed' : 'pending';

    const order = new Order({
      deliveryAddress: address,
      userId: req.session.user_id,
      userName: userData.name,
      paymentMethod: paymentMethod,
      products: products,
      totalAmount: total,
      status: status,
      date: new Date(),
    });

    const orderData = await order.save();
    if (orderData) {
      for (let i = 0; i < products.length; i++) {
        const pro = products[i].productid;
        const count = products[i].count;
        await Product.findByIdAndUpdate({ _id: pro }, { $inc: { quantity: -count } });
      }

      if (order.status === 'placed') {
        await Cart.deleteOne({ userId: req.session.user_id });
        res.json({ codsuccess: true });
      } else {
        const orderId = orderData._id;
        const totalAmount = orderData.totalAmount;
        var options = {
          amount: totalAmount * 100,
          currency: 'INR',
          receipt: '' + orderId,
        };

        instance.orders.create(options, function (err, order) {
            res.json({ order });
          
        });
      }
    } else {
      res.redirect('/');
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

//load order management

const loadOrderManagement = async(req,res) =>{
  try {
    const adminData = await User.findById(req.session.Auser_id)
    const orderData = await Order.find().populate("products.productid").sort({ date: -1 });

    res.render('order-management',{admin:adminData,order:orderData})
    
  } catch (error) {
    console.log(error,message);
  }
}


  //single order detail page in adminside

  const loadSingleDetails = async(req,res)=>{
    try {
      const id = req.params.id
      console.log(id);
      const adminData = await User.findById(req.session.Auser_id)
      const orderData = await Order.findOne({_id : id }).populate(
        "products.productid"
      );
      res.render('single-order-deatils',{ admin:adminData,orders:orderData});
    } catch (error) {
      console.log(error.message);
    }
  }

 //load my order


const loadMyOrder = async (req, res) => {
    try {
      const session = req.session.user_id;
      const user = await User.findById(session);
      const orderData = await Order.find({ userId: session }).populate("products.productid")
      
      const orderProducts = orderData.map(order => order.products); 
  
      res.render('my-orders', { session, user, orderProducts,orderData });
    } catch (error) {
      console.log(error.message);
    }
  };


  //single order page loadind

  const loadSingleOrder = async(req,res)=>{
    try {
      const id = req.params.id
      const session = req.session.user_id
      const orderData = await Order.findOne({_id : id }).populate(
        "products.productid"
      );
      res.render('single-order-page', { session,orders:orderData});
    } catch (error) {
      console.log(error.message);
    }
  }

  //verify payment from razorpay

  const verifyPayment = async (req,res)=>{
    try{
      const details = req.body
      const crypto = require('crypto');
      const hmac = crypto.createHmac('sha256', process.env.Razorpay_Key_Secret);
      hmac.update(details.payment.razorpay_order_id + '|' + details.payment.razorpay_payment_id);
      const hmacValue = hmac.digest('hex');
    
      if(hmacValue === details.payment.razorpay_signature){
        await Order.findByIdAndUpdate({_id:details.order.receipt},{$set:{status:"placed"}});
        await Order.findByIdAndUpdate({_id:details.order.receipt},{$set:{paymentId:details.payment.razorpay_payment_id}});
        await Cart.deleteOne({userId:req.session.user_id});
        res.json({success:true});
      }else{
        await Order.findByIdAndRemove({_id:details.order.receipt});
        res.json({success:false});
      }
    }catch(error){
        console.log(error.message)
   }
  }


    module.exports = {
        placeOrder,
        loadMyOrder,
        verifyPayment,
        loadSingleOrder,
        loadOrderManagement,
        loadSingleDetails
    }