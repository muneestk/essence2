const Wishlist = require('../models/wishlist-model');
const User = require('../models/user-models');
const Product = require('../models/product-model');

// Load wishlist

const wishlistLoad = async (req, res) => {
  try {
    const session = req.session.user_id;
    const wishlistData = await Wishlist.find({ userId: session }).populate('products.productId');
    console.log(wishlistData);
    if (wishlistData.length > 0) {
      const wishlist = wishlistData[0].products;
      const products = wishlist.map(wish => wish.productId);
      res.render('wishlist-page', { session, wishlist, products });
    } else {
      res.render('wishlist-page', { session, wishlist: [], products: [] });
    }
  } catch (error) {
    console.log(error.message);
  }
};

//remove from wishlist in singleproduct

const deleteSingleWishlist = async (req, res) => {
    try {
      const id = req.query.id;
      const user_id = req.session.user_id;
      await Wishlist.findOneAndUpdate(
        {userId:user_id},
        { $pull: { products: { productId: id } } }
      );

      res.redirect('/showProduct?id='+id);
    } catch (error) {
      console.log(error.message);
    
    }
  };


//delete from wishlist


const deleteWishlist = async (req, res) => {
  try {
    const id = req.query.id;
    const user_id = req.session.user_id;
    const updatedWishlist = await Wishlist.findOneAndUpdate(
      {userId:user_id},
      { $pull: { products: { productId: id } } }
    );
    res.redirect('/wishlist-page');
  } catch (error) {
    console.log(error.message);
  
  }
};


// Add to wishlist


const addToWishlist = async (req, res) => {
  try {
    const id = req.body.proId;
    const user = req.session.user_id
    const userData = await User.findById(user)
    const wishlistData = await Wishlist.findOne({ userId:user });

    if (wishlistData) {
      const checkWishlist = await wishlistData.products.findIndex((wish) => wish.productId == id);


      if (checkWishlist != -1) {
        res.json({ check: true });
      } else {
        await Wishlist.updateOne({ userId: req.session.user_id }, { $push: { products: { productId: id } } });
        res.json({ success: true });
      }
    } else {
      const wishlist = new Wishlist({
        userId: req.session.user_id,
        userName: userData.name, 
        products: [
          {
            productId: id,
          },
        ],
      });

      const wish = await wishlist.save();
      if (wish) {
        res.json({ success: true });
      }
    }
  } catch (error) {
    console.log(error.message);
  }
};



module.exports = {
  wishlistLoad,
  addToWishlist,
  deleteWishlist,
  deleteSingleWishlist,
  
};
