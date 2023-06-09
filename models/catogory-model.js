const mongoose = require("mongoose");

const category = mongoose.Schema({
  categoryname: {
    type: String,
    required: true,
  },
  is_delete: {
    type:Boolean,
    default:false,
  }
});

module.exports = mongoose.model("category", category);
