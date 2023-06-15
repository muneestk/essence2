const User = require("../models/user-models");
const bcrypt = require("bcrypt");
const category = require("../models/catogory-model")
const Order = require("../conrollers/order-controller")


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

//loading dashboard

const loadDashboard = async (req, res ,next) => {
  try {
    const adminData = await User.findById({ _id: req.session.Auser_id });
    res.render("dash-board", { admin: adminData });
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
    const userData = await User.findByIdAndUpdate(req.query.id,{$set:{is_block:true}})
    req.session.user_id = null
    res.redirect("/admin/users-list")
  } catch (error) {
    console.log(error.message);
  }
}

//unblocking user from admin

const unblock = async (req,res)=> {
  try {
    const userData = await User.findByIdAndUpdate(req.query.id,{$set:{is_block:false}})
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
   

  }