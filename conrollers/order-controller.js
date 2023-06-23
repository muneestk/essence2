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

    const orderid = order._id
  
    if (orderData) {
        //cash on delivery
      if (order.status === 'placed') {
        await Cart.deleteOne({ userId: req.session.user_id });
        for (let i = 0; i < products.length; i++) {
          const pro = products[i].productid;
          const count = products[i].count;
          await Product.findByIdAndUpdate({ _id: pro }, { $inc: { quantity: -count } });
        }
  
        res.json({ codsuccess: true ,orderid});
      } else {
      
        //wallet payment
        if(order.paymentMethod === 'Wallet-Payment'){
          const wallet = userData.wallet
          if(wallet >= total){
            await Cart.deleteOne({ userId: req.session.user_id });
            for (let i = 0; i < products.length; i++) {
              const pro = products[i].productid;
              const count = products[i].count;
              await Product.findByIdAndUpdate({ _id: pro }, { $inc: { quantity: -count } });
              await User.findOneAndUpdate({_id:req.session.user_id},{$inc:{wallet: -total}})
              await Order.findOneAndUpdate({_id:order._id},{$set:{status:"placed"}});
              res.json({ codsuccess: true ,orderid});
            }
          }else{
            res.json({walletFailed:true});
          }
        }else{

          //razor payment
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
    } 
    } else {
      res.redirect('/');
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

  //verify payment from razorpay

  const verifyPayment = async (req,res)=>{
    try{
      const cartData = await Cart.findOne({ userId: req.session.user_id });
      const products = cartData.products;
      const details = req.body
      const crypto = require('crypto');
      const hmac = crypto.createHmac('sha256', process.env.Razorpay_Key_Secret);
      hmac.update(details.payment.razorpay_order_id + '|' + details.payment.razorpay_payment_id);
      const hmacValue = hmac.digest('hex');
    
      if(hmacValue === details.payment.razorpay_signature){
        for (let i = 0; i < products.length; i++) {
          const pro = products[i].productid;
          const count = products[i].count;
          await Product.findByIdAndUpdate({ _id: pro }, { $inc: { quantity: -count } });
        }
        await Order.findByIdAndUpdate({_id:details.order.receipt},{$set:{status:"placed"}});
        await Order.findByIdAndUpdate({_id:details.order.receipt},{$set:{paymentId:details.payment.razorpay_payment_id}});
        await Cart.deleteOne({userId:req.session.user_id});
        const orderid = details.order.receipt 
        res.json({ codsuccess: true ,orderid});
      }else{
        await Order.findByIdAndRemove({_id:details.order.receipt});
        res.json({success:false});
      }
    }catch(error){
        console.log(error.message)
   }
  }

//load order management

const loadOrderManagement = async(req,res) =>{
  try {
    const adminData = await User.findById(req.session.Auser_id)
    const DeletePending = await Order.deleteMany({status:'pending'})
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
      const adminData = await User.findById(req.session.Auser_id)
      const orderData = await Order.findOne({_id : id }).populate(
        "products.productid"
      );
      const orderDate = orderData.date
      const expectedDate  = new Date(orderDate.getTime() + (5 * 24 * 60 * 60 * 1000));
      res.render('single-order',{ admin:adminData,orders:orderData,expectedDate});
    } catch (error) {
      console.log(error.message);
    }
  }

 //load my order

  const loadMyOrder = async (req, res) => {
    try {
      const session = req.session.user_id;
      const user = await User.findById(session);
      const DeletePending = await Order.deleteMany({status:'pending'})
      const orderData = await Order.find({ userId: session }).populate("products.productid").sort({ date: -1 });
      
      const orderProducts = orderData.map(order => order.products); 
  
      res.render('my-orders', { session, user, orderProducts,orderData });
    } catch (error) {
      console.log(error.message);
    }
  };


  //single order page loading

  const loadSingleOrder = async(req,res)=>{
    try {
      const id = req.params.id
      const session = req.session.user_id
      const orderData = await Order.findOne({_id : id }).populate(
        "products.productid"
      );
      const orderDate = orderData.date
      const expectedDate  = new Date(orderDate.getTime() + (5 * 24 * 60 * 60 * 1000));
      res.render('single-order-page', { session,orders:orderData,expectedDate});
    } catch (error) {
      console.log(error.message);
    }
  }

  //order canceling

  const orderReturn = async (req, res) => {
    try {
      const id = req.body.orderid;
      const reason = req.body.reason
      const ordersId = req.body.ordersid;
      const Id = req.session.user_id
      const orderData = await Order.findOne({ userId: Id, 'products._id': id})
      const product = orderData.products.find((p) => p._id.toString() === id);
      const cancelledAmount = product.totalPrice  
      const proId = product.productid 
      const proCount = product.count
      const updatedOrder = await Order.findOneAndUpdate(
        {
          userId:Id,
          'products._id': id
        },
        {
          $set: {
            'products.$.status': 'returned',
            'products.$.returnReason': reason
          }
        },
        { new: true }
      );

      if (updatedOrder) {
        await Product.findByIdAndUpdate(proId,{$inc:{StockQuantity:proCount}})
        await User.findByIdAndUpdate({_id:req.session.user_id},{$inc:{wallet:cancelledAmount}})
        await Order.findOneAndUpdate({userId:req.session.user_id,'products._id': id},{$inc:{'products.$.totalPrice':-cancelledAmount}})
        await Order.findOneAndUpdate({userId:req.session.user_id,'products._id': id},{$inc:{totalAmount:-cancelledAmount}})
        res.redirect("/single-order-page/" + ordersId)
      } else {
        res.redirect("/single-order-page/" + ordersId)
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  //return orders 

  const orderCancel = async (req, res) => {
    try {
      const id = req.body.orderid;
      const reason = req.body.reason
      const ordersId = req.body.ordersid;
      const Id = req.session.user_id
      const orderData = await Order.findOne({ userId: req.session.user_id, 'products._id': id})
      const product = orderData.products.find((p) => p._id.toString() === id);
      const cancelledAmount = product.totalPrice  
      const proId = product.productid 
      const proCount = product.count
      const updatedOrder = await Order.findOneAndUpdate(
        {
          userId:Id,
          'products._id': id
        },
        {
          $set: {
            'products.$.status': 'cancelled',
            'products.$.cancelReason': reason
          }
        },
        { new: true }
      );

  
      if (updatedOrder) {
        await Product.findByIdAndUpdate(proId,{$inc:{StockQuantity:proCount}})

        if(orderData.paymentMethod === 'online-payment' || orderData.paymentMethod === 'Wallet-Payment'){
           await User.findByIdAndUpdate({_id:req.session.user_id},{$inc:{wallet:cancelledAmount}})
           await Order.findOneAndUpdate({userId:req.session.user_id,'products._id': id},{$inc:{'products.$.totalPrice':-cancelledAmount}})
           await Order.findOneAndUpdate({userId:req.session.user_id,'products._id': id},{$inc:{totalAmount:-cancelledAmount}})
           res.redirect("/single-order-page/" + ordersId)
        }else{
          res.redirect("/single-order-page/" + ordersId)
        }
      } else {
        res.redirect("/single-order-page/" + ordersId)
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  //changing order status

  const changeStatus = async(req,res) =>{
    try {
      const id = req.body.id
      const userId = req.body.userId
      const statusChange = req.body.status
      const updatedOrder = await Order.findOneAndUpdate(
        {
          userId: userId,
          'products._id': id
        },
        {
          $set: {
            'products.$.status': statusChange
          }
        },
        { new: true }
      );
      if(statusChange === 'Delivered'){
        const expiryDateTimestamp = new Date().getTime() + (7 * 24 * 60 * 60 * 1000);
        const expiryDate = new Date(expiryDateTimestamp);

        await Order.findOneAndUpdate(
          {
            userId: userId,
            'products._id': id
          },
          {
            $set: {
              'products.$.expiryDate': expiryDate
            },
          },
          {
            new: true
          });
      }
      if(updatedOrder){
        res.json({success:true})
      }
    } catch (error) {
      console.log(error.message);
    }
  }


  //load order success page
  
  const loadOrderSuccess = async(req,res)=>{
    try {
      const id = req.params.id
      const session = req.session.user_id
      const orderData = await Order.findOne({_id : id }).populate(
        "products.productid"
      );
      const orderDate = orderData.date
      const expectedDate  = new Date(orderDate.getTime() + (5 * 24 * 60 * 60 * 1000));
      res.render('order-success', { session,orders:orderData,expectedDate});
    } catch (error) {
      console.log(error.message);
    }
  }
  



    module.exports = {
        placeOrder,
        loadMyOrder,
        verifyPayment,
        loadSingleOrder,
        loadOrderManagement,
        loadSingleDetails,
        changeStatus,
        orderCancel,
        loadOrderSuccess,
        orderReturn
    }