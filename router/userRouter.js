const express = require('express');
const user_route = express();

const auth = require('../middleware/Auth');
const userController = require('../conrollers/user-controller');
const cartController = require('../conrollers/cart-controller')
const addressController = require('../conrollers/address-controller')
const orderController = require('../conrollers/order-controller')
const wishlistController = require('../conrollers/wishlist-controller')

user_route.set('view engine', 'ejs');
user_route.set('views', './views/users');

//user controller

user_route.get('/register', auth.isLogout, userController.loadRegister);
user_route.get('/verification',auth.isLogout, userController.verifyEmail);
user_route.get('/', auth.isLogout, userController.loadHome);
user_route.get('/login', auth.isLogout, userController.loginload);
user_route.get('/home-page', auth.isLogin ,auth.blocked, userController.loadHome);
user_route.get("/logout" , userController.userLogout);
user_route.get('/shop-page',auth.blocked,auth.isLogin,userController.loadShop)
user_route.get('/showProduct',userController.loadSingleProduct)
user_route.get('/user-profile',auth.isLogin,auth.blocked,userController.loaduserprofile)
user_route.get('edit-profile/:id',auth.isLogin,userController.editProfile)
user_route.get('/filter-category/:id',userController.filterCategory)
user_route.get('/forgot-password',userController.loadForgotPassword)



user_route.post('//price-sort',userController.priceSort)
user_route.post('/resubmit-password',userController.resubmitPassword)
user_route.post('/verify-forgot',userController.verifForgotMail)
user_route.post('/forgot-password',userController.forgotVerifyMail)
user_route.post('/update-user',userController.updateUser)
user_route.post('/login', userController.verifyLogin);
user_route.post('/register', userController.insertUser);
user_route.post('/verification', userController.verifyEmail);
user_route.post('/search-products', userController.searchProducts);

//cart controller

user_route.get('/checkout-page',auth.isLogin,cartController.loadChekout)
user_route.get('/empty-checkout',auth.isLogin,cartController.loademptyCheckout)
user_route.get('/cart-page',auth.isLogin,auth.blocked,cartController.loadCart)
user_route.post('/delete-Cart-product',cartController.deleteCartProduct)
user_route.post('/addtocart',auth.isLogin,auth.blocked,cartController.addToCart)
user_route.post('/change-quantity',auth.isLogin,cartController.changeProductCount)

//address controller

user_route.get('/add-address',auth.isLogin,addressController.loadAddAddress)
user_route.get('/edit-address',auth.isLogin,addressController.loadEditAddress)
user_route.post('/add-address',auth.isLogin,addressController.insertAddress)
user_route.post('/update-address',auth.isLogin,addressController.updateAddress)
user_route.post('/delete-address',addressController.deleteAddress)

//wishlist controller

user_route.get('/delete-wishlist',wishlistController.deleteWishlist)
user_route.get('/delete-wishlist-single',wishlistController.deleteSingleWishlist)
user_route.get('/wishlist-page',auth.isLogin,wishlistController.wishlistLoad)
user_route.post('/addtoWishlist',wishlistController.addToWishlist)

//order controller

user_route.get('/my-orders',auth.isLogin,orderController.loadMyOrder)
user_route.get('/single-order-page/:id',orderController.loadSingleOrder)
user_route.post('/cancel-order',orderController.orderCancel)
user_route.post('/checkout-page',orderController.placeOrder)
user_route.post('/verify-payment',orderController.verifyPayment)


module.exports = user_route;



