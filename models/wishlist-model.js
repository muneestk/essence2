const { ObjectId } = require('mongodb')
const mongoose = require('mongoose')
const { Schema, Types } = mongoose;

const wishlistSchema = new Schema({
  userId: {
    type: String,
    required: true,
    ref: 'user'
  },
  userName: {
    type: String,
    required: true
  },
  products: [{
    productId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Product'
    }
  }]
});

module.exports = mongoose.model('wishlist',wishlistSchema)