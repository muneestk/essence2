const category = require("../models/catogory-model");
const User = require("../models/user-models");
const Banner = require("../models/banner-modal");
const uc = require("upper-case");

//listing category
const categoryList = async (req, res) => {
  try {
    const adminData = await User.findById({ _id: req.session.Auser_id });
    const catData = await category.find({ is_delete: false });
    res.render("category-list", { category: catData, admin: adminData });
  } catch (error) {
    console.log(error.message);
  }
};

//  updating and saving the catagory
const saveCatogary = async (req, res) => {
  try {
    const name = uc.upperCase(req.body.categoryname);
    const catagoryDatas = await category.find({ is_delete: false });
    const adminData = await User.findById({ _id: req.session.Auser_id });

    //white space checking

    if (name.trim().length == 0) {
      return res.render("category-list", {
        message: "Invalid typing",
        admin: adminData,
        category: catagoryDatas,
      });
    }

    //allreday exist checking

    const catData = await category.findOne({ categoryname: name });

    if (catData) {
      return res.render("category-list", {
        message: "This category is already exist",
        admin: adminData,
        category: catagoryDatas,
      });
    }

    const catDATA = await category.findOneAndUpdate(
      { _id: req.body.id },
      { $set: { categoryname: name } }
    );
    if (catDATA) {
      res.redirect("/admin/category-list");
    }
  } catch (error) {
    console.log(error.message);
  }
};

//  Adding the catagory

const insertCategory = async (req, res) => {
  try {
    const catagoryDatas = await category.find({ is_delete: false });
    const adminData = await User.findById({ _id: req.session.Auser_id });
    const catName = uc.upperCase(req.body.categoryname);

    //white space checking

    if (catName.trim().length == 0) {
      return res.render("category-list", {
        message: "Invalid typing",
        admin: adminData,
        category: catagoryDatas,
      });
    }

    //allreday exist checking

    const catData = await category.findOne({ categoryname: catName });
    if (catData) {
      await category.updateOne(
        { categoryname: catName },
        { $set: { is_delete: false } }
      );
      return res.render("category-list", {
        message: "This category is already exist",
        admin: adminData,
        category: catagoryDatas,
      });
    }

    //add new category

    const Category = new category({
      categoryname: catName,
    });
    const categoryData = await Category.save();
    if (categoryData) {
      res.redirect("/admin/category-list");
    } else {
      res.render("category-list", {
        admin: adminData,
        category: catagoryDatas,
        message: "something error",
      });
    }
  } catch (error) {
    console.log(error.message);
  }
};

//  delete the catagory

const deletecategory = async (req, res) => {
  try {
    const id = req.query.id;
    await category.updateOne({ _id: id }, { $set: { is_delete: true } });
    res.redirect("/admin/category-list");
  } catch (error) {
    console.log(error.message);
  }
};

//load banner page on admin side

const bannerList = async (req, res) => {
  try {
    const adminData = await User.findById({ _id: req.session.Auser_id });
    const catData = await category.find({ is_delete: false });
    const banners = await Banner.find();
    res.render("banner-list", { category: catData, admin: adminData, banners });
  } catch (error) {
    console.log(error.message);
  }
};

//add banner from admin side

const saveBanner = async (req, res) => {
  try {
    const text = req.body.text;
    let image = "";
    if (req.file) {
      image = req.file.filename;
    }
    const savebanner = new Banner({
      image: image,
      text: text,
    });
    savebanner.save();
    res.redirect("/admin/banner-list");
  } catch (error) {
    console.log(error.message);
  }
};

// update banner

const updateBanner = async (req, res) => {
  try {
    const id = req.body.id;
    const text = req.body.text;
    let image = req.body.img;
    if (req.file) {
      image = req.file.filename;
    }
    await Banner.findOneAndUpdate(
      { _id: id },
      {
        $set: {
          text: text,
          image: image,
        },
      }
    );
    res.redirect("/admin/banner-list");
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  categoryList,
  saveCatogary,
  insertCategory,
  deletecategory,
  bannerList,
  saveBanner,
  updateBanner,
};
