const express = require("express");
const mongoose = require("mongoose");
const Product = require("../models/Product");

const router = express.Router();

// Homepage
router.get("/", async (req, res) => {
  try {
    let products = [];
    if (mongoose.connection.readyState === 1) {
      products = await Product.find().limit(4);
    }

    res.render("home", {
      title: "Homepage",
      products,
    });
  } catch (err) {
    console.error("Error loading homepage:", err);

    // Keep homepage available even when database is temporarily unavailable.
    res.status(200).render("home", {
      title: "Homepage",
      products: [],
    });
  }
});

// About page
router.get("/about", (req, res) => {
  try {
    res.render("about", { title: "About Us" });
  } catch (err) {
    console.error("Error loading about page:", err);
    res.status(500).send("Error loading About page");
  }
});

// Contact page
router.get("/contact", (req, res) => {
  try {
    res.render("contact", { title: "Contact Us" });
  } catch (err) {
    console.error("Error loading contact page:", err);
    res.status(500).send("Error loading Contact page");
  }
});

module.exports = router;