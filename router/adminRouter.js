const express = require("express")
const admin_route = express();
// const multer = require('multer');
const Auth = require("../middleware/adminauth");
const update = require('../config/multer')
const adminController = require("../conrollers/admin-controller");
const categoryController = require('../conrollers/category-controll')
const productController = require("../conrollers/product-controller")
const orderController = require("../conrollers/order-controller")
const errorHandler = require('../middleware/error-handling')
const coupenController = require('../conrollers/coupen-controller')

admin_route.set("view engine", "ejs");
admin_route.set("views", "./views/admin");


//admin controller

admin_route.get("/",Auth.isLogout,adminController.loadLogin);
admin_route.get("/dash-board", Auth.isLogin, adminController.loadDashboard);
admin_route.get("/sales-report", Auth.isLogin, adminController.loadSalesReport);
admin_route.get("/logout", adminController.logout);
admin_route.get("/users-list", Auth.isLogin, adminController.loadUsers);
admin_route.post("/",adminController.verifyLogin);
admin_route.get('/block-user',Auth.isLogin,adminController.block);
admin_route.get('/unblock-user',Auth.isLogin,adminController.unblock);
admin_route.get('/sales-sort/:id',Auth.isLogin,adminController.salesSort);
admin_route.post('/range-sort',Auth.isLogin,adminController.rangeSort);
admin_route.post("/",adminController.verifyLogin);

//category controller   

admin_route.get('/category-list',Auth.isLogin,categoryController.categoryList);
admin_route.get('/delete-category',Auth.isLogin,categoryController.deletecategory);
admin_route.post('/edit-category',categoryController.saveCatogary);
admin_route.post('/insert-category',categoryController.insertCategory);

//bannner in category controller

admin_route.get('/banner-list',Auth.isLogin,categoryController.bannerList)
admin_route.post('/insert-banner',update.upload.single('image'),categoryController.saveBanner)
admin_route.post('/edit-banner',update.upload.single('image'),categoryController.updateBanner)

//product controller

admin_route.get("/products-list", Auth.isLogin, productController.loadProducts);      
admin_route.get("/add-product", Auth.isLogin, productController.addProducts);
admin_route.get("/delete-product", Auth.isLogin, productController.deleteProduct);
admin_route.get("/edit-product/:id", Auth.isLogin, productController.editProduct);
admin_route.get("/delete-image/:imgid/:prodid", Auth.isLogin, productController.removeImg);
admin_route.post('/edit-product/:id', update.upload.array('image', 10), productController.saveProduct);
admin_route.post('/insert-products',update.upload.array('image',10),productController.insertProducts)
admin_route.post('/edit-product/updateimage/:id', update.upload.array('image', 10), productController.updateimage);

//order controller

admin_route.get('/order-management',Auth.isLogin, orderController.loadOrderManagement)
admin_route.get('/single-order/:id',Auth.isLogin,orderController.loadSingleDetails)
admin_route.post('/changeStatus',orderController.changeStatus)

//coupen controller

admin_route.get('/coupen-list',Auth.isLogin,coupenController.loadCoupenController)
admin_route.post('/insert-coupen',coupenController.insertCoupen)
admin_route.post('/update-coupen/:id',coupenController.updateCoupen)
admin_route.post('/delete-coupen',coupenController.deleteCoupen)
admin_route.post('/add-offer',coupenController.addOffer)








admin_route.use(errorHandler)



module.exports=admin_route