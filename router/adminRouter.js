const express = require("express")
const admin_route = express();
const multer = require('multer');
const Auth = require("../middleware/adminauth");
const update = require('../config/multer')
const adminController = require("../conrollers/admin-controller");
const categoryController = require('../conrollers/category-controll')
const productController = require("../conrollers/product-controller")

admin_route.set("view engine", "ejs");
admin_route.set("views", "./views/admin");

admin_route.get("/",Auth.isLogout,adminController.loadLogin);
admin_route.get("/dash-board", Auth.isLogin, adminController.loadDashboard);
admin_route.get("/logout", adminController.logout);
admin_route.get("/users-list", Auth.isLogin, adminController.loadUsers);
admin_route.post("/",adminController.verifyLogin);
admin_route.get('/block-user',Auth.isLogin,adminController.block);
admin_route.get('/unblock-user',Auth.isLogin,adminController.unblock);
admin_route.post("/",adminController.verifyLogin);

admin_route.get('/category-list',Auth.isLogin,categoryController.categoryList);
admin_route.get('/category-list',Auth.isLogin,categoryController.categoryList);
admin_route.get('/edit-category',Auth.isLogin,categoryController.editCatogary);
admin_route.get('/delete-category',Auth.isLogin,categoryController.deletecategory);
admin_route.post('/edit-category',categoryController.saveCatogary);
admin_route.post('/insert-category',categoryController.insertCategory);

admin_route.get("/products-list", Auth.isLogin, productController.loadProducts);      
admin_route.get("/add-product", Auth.isLogin, productController.addProducts);
admin_route.get("/delete-product", Auth.isLogin, productController.deleteProduct);
admin_route.post('/insert-products',update.upload.array('image',10),productController.insertProducts)

admin_route.get("/edit-product/:id", Auth.isLogin, productController.editProduct);
admin_route.get("/delete-image/:imgid/:prodid", Auth.isLogin, productController.removeImg);
admin_route.post('/edit-product/:id', update.upload.array('image', 10), productController.saveProduct);
admin_route.post('/edit-product/updateimage/:id', update.upload.array('image', 10), productController.updateimage);








module.exports=admin_route