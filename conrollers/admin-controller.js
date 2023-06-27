const User = require("../models/user-models");
const bcrypt = require("bcrypt");
const Order = require("../models/order-modal")
const Product = require("../models/product-model")

//loading admin login page

  const loadLogin = async (req, res) => {
    try {
      res.render("login");
    } catch (error) {
      console.log(error.message);
    }
  };  

//verify admin in login page
  
const verifyLogin = async (req, res ,next) => {
  try {
    const email = req.body.email;
    const password = req.body.password;

    const userData = await User.findOne({ email: email });

    if (userData) {
      const passwordMatch = await bcrypt.compare(password, userData.password);

      if (passwordMatch) {
        if (userData.is_admin === 0) {
          res.render("login", {
            message: "Email and password is incorrect, not an admin",
          });
        } else {
          req.session.Auser_id = userData._id;
          res.redirect("/admin/dash-board");
        }
      } else {
        res.render("login", { message: "Email or password is incorrect" });
      }
    } else {
      res.render("login", {
        message: "Please provide your Email and password",
      });
    }
  } catch (error) {
    next(error)
    console.log(error.message);
  }
};

//loading sales report page 

const loadSalesReport = async(req,res) =>{
  try {
    const adminData = await User.findById({ _id: req.session.Auser_id });
   const order = await Order.aggregate([
  { $unwind: "$products" },
  { $match: { 'products.status': 'Delivered' } },
  { $sort: { date: -1 } },
  {
    $lookup: {
      from: 'products',
      let: { productId: { $toObjectId: '$products.productid' } },
      pipeline: [
        { $match: { $expr: { $eq: ['$_id', '$$productId'] } } }
      ],
      as: 'products.productDetails'
    }
  },  
  {
    $addFields: {
      'products.productDetails': { $arrayElemAt: ['$products.productDetails', 0] }
    }
  }
]);
    res.render("sales-report", { order ,admin:adminData });
  } catch (error) {
    console.log(error.message);
  }
}

//sort sales report

const salesSort = async(req,res) =>{
  try {
    const adminData = await User.findById({ _id: req.session.Auser_id });
    const id = parseInt(req.params.id);
    const from = new Date();
    const to = new Date(from.getTime() - id * 24 * 60 * 60 * 1000);
    
    const order = await Order.aggregate([
      { $unwind: "$products" },
      {$match: {
        'products.status': 'Delivered',
        $and: [
          { 'products.deliveredDate': { $gt: to } },
          { 'products.deliveredDate': { $lt: from } }
        ]
      }},
      { $sort: { date: -1 } },
      {
        $lookup: {
          from: 'products',
          let: { productId: { $toObjectId: '$products.productid' } },
          pipeline: [
            { $match: { $expr: { $eq: ['$_id', '$$productId'] } } }
          ],
          as: 'products.productDetails'
        }
      },  
      {
        $addFields: {
          'products.productDetails': { $arrayElemAt: ['$products.productDetails', 0] }
        }
      }
    ]);

    res.render("sales-report", { order ,admin:adminData });
   
  } catch (error) {
    console.log(error.message);
  }
}




//loading dashboard

const loadDashboard = async (req, res ,next) => {
  try {
    const user = await User.find()
    const orders =await Order.find()
    const order = await Order.find({'products.status': 'Delivered' })
    .populate('products.productid')
    .sort({ date: -1 });  
    const product = await Product.find() 
    const adminData = await User.findById({ _id: req.session.Auser_id });

    //find total delivered sale

    const result = await Order.aggregate([
      { $unwind: "$products" },
      { $match: { 'products.status': 'Delivered' } },
      {
        $group: {
          _id: null,
          total: { $sum: '$products.totalPrice' }
        }
      },
      {
        $project: {
          _id: 0,
          total: 1
        }
      }
    ]);

    let total = 0;
      if (result.length > 0) {
        total = result[0].total;
    } 
   

    //total cod sale

    const codResult = await Order.aggregate([
      { $unwind: "$products" },
      { $match: { 'products.status': 'Delivered', paymentMethod: 'COD' } },
      {
        $group: {
          _id: null,
          total: { $sum: '$products.totalPrice' }
        }
      },
      {
        $project: {
          _id: 0,
          total: 1
        }
      }
    ]);
    
    let codTotal = 0
    if (codResult.length > 0) {
      codTotal = codResult[0].total;
    } 

    //total online payment and wallet
    const onlineResult = await Order.aggregate([
      { $unwind: "$products" },
      { $match: { 'products.status': 'Delivered', 'paymentMethod': { $ne: 'COD' } } },
      {
        $group: {
          _id: null,
          total: { $sum: '$products.totalPrice' }
        }
      },
      {
        $project: {
          _id: 0,
          total: 1
        }
      }
    ]);
    
    let onlineTotal = 0;
    if (onlineResult.length > 0) {
      onlineTotal = onlineResult[0].total;
    }
    

    res.render("dash-board", { admin: adminData , user , order , product , total , codTotal , onlineTotal , orders });
  } catch (error) {
    next(error)
    console.log(error.message);
  }
};

//loading users list

const loadUsers= async (req, res) => {
  try {
   
    const adminData = await User.findById({ _id: req.session.Auser_id });
    const userData = await User.find({is_verified:true});
  
    res.render("users-list", { user: userData ,admin:adminData});
  } catch (error) {
    console.log(error.message);
  }
};



//blocking users from admin

const block = async (req,res)=> {
  try {
    await User.findByIdAndUpdate(req.query.id,{$set:{is_block:true}})
    req.session.user_id = null
    res.redirect("/admin/users-list")
  } catch (error) {
    console.log(error.message);
  }
}

//unblocking user from admin

const unblock = async (req,res)=> {
  try {
    await User.findByIdAndUpdate(req.query.id,{$set:{is_block:false}})
    res.redirect("/admin/users-list")
  } catch (error) {
    console.log(error.message);
 }
}

//admin logout

const logout = async (req, res) => {
  try {
    req.session.destroy();
    res.redirect("/admin");
  } catch (error) {
    console.log(error.message);
  }
};


  module.exports={
    loadLogin,
    verifyLogin,
    loadDashboard,
    logout,
    loadUsers,
    block,unblock,
    loadSalesReport,
    salesSort

  }