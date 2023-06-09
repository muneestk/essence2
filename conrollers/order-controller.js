const Cart = require("../models/cart-model");
const User = require("../models/user-models");
const Product = require("../models/product-model");
const Order = require('../models/order-modal')

//place order

const placeOrder = async(req,res)=>{
    try {
        const userData = await User.findOne({_id:req.session.user_id})
        const address = req.body.address
        const cartData = await Cart.findOne({userId:req.session.user_id});
        const products = cartData.products;
        const total = parseInt(req.body.Total);
        
         const order = new Order({
            deliveryAddress:address,
            userId:req.session.user_id,
            userName:userData.name,
            products:products,
            totalAmount:total,
            date:new Date(),
         })
         const orderData = await order.save()
         if(orderData){
            for(let i=0;i<products.length;i++){
                const pro = products[i].productid
                const count = products[i].count
                await Product.findByIdAndUpdate({_id:pro},{$inc:{quantity:-count}})
            }
                await Cart.deleteOne({userId:req.session.user_id})
                res.json({codsuccess:true})
            }else{
                res.redirect('/')
            }
         } catch (error) {
            console.log(error.message);
      }
    }


    //load my order


const loadMyOrder = async (req, res) => {
    try {
      const session = req.session.user_id;
      const user = await User.findById(session);
      const orderData = await Order.find({ userId: session }).populate(
        "products.productid"
      );
      const orderProducts = orderData.map(order => order.products); 
      console.log(orderProducts);
  
      res.render('my-orders', { session, user, orderProducts });
    } catch (error) {
      console.log(error.message);
    }
  };






    module.exports = {
        placeOrder,
        loadMyOrder
    }