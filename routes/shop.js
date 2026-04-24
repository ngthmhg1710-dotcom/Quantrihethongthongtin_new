const express = require("express");
const Product = require("../models/Product");
const Order = require("../models/Order");

const router = express.Router();

router.get("/products", async (req, res) => {
  const search = (req.query.search || "").trim();
  const category = (req.query.category || "all").trim();
  const skinType = (req.query.skinType || "all").trim();
  const maxPrice = Number(req.query.maxPrice || 1000);

  const query = {};
  if (search) query.name = { $regex: search, $options: "i" };
  if (category !== "all") query.category = category;
  if (skinType !== "all") query.badges = skinType;
  if (!Number.isNaN(maxPrice)) query.price = { $lte: Math.max(maxPrice, 0) };

  const [products, categories] = await Promise.all([
    Product.find(query).sort({ createdAt: -1 }),
    Product.distinct("category"),
  ]);

  res.render("products", {
    title: "Shop All Products",
    products,
    filters: {
      search,
      category,
      skinType,
      maxPrice: Number.isNaN(maxPrice) ? 1000 : Math.max(maxPrice, 0),
    },
    categories: (categories || []).filter(Boolean),
    skinTypes: ["Dry", "Oily", "Combination", "Normal", "Sensitive"],
  });
});

router.get("/products/:slug", async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug });
  if (!product) return res.redirect("/products");
  res.render("product-detail", { title: "Product Detail", product });
});

router.post("/cart/add/:id", async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.redirect("/products");

  const found = req.session.cart.find((item) => item.id === String(product._id));
  if (found) {
    found.quantity += 1;
  } else {
    req.session.cart.push({
      id: String(product._id),
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1,
    });
  }
  res.redirect("/cart");
});

router.get("/cart", (req, res) => {
  const total = req.session.cart.reduce((acc, item) => acc + item.quantity * item.price, 0);
  res.render("cart", { title: "Shopping Cart", items: req.session.cart, total });
});

router.post("/cart/update/:id", (req, res) => {
  const quantity = Number(req.body.quantity || 1);
  req.session.cart = req.session.cart
    .map((item) => (item.id === req.params.id ? { ...item, quantity } : item))
    .filter((item) => item.quantity > 0);
  res.redirect("/cart");
});

router.get("/checkout", (req, res) => {
  const total = req.session.cart.reduce((acc, item) => acc + item.quantity * item.price, 0);
  res.render("checkout", { title: "Checkout", items: req.session.cart, total });
});

router.post("/checkout", async (req, res) => {
  const total = req.session.cart.reduce((acc, item) => acc + item.quantity * item.price, 0);
  if (!req.session.cart.length) return res.redirect("/products");

  await Order.create({
    customerName: req.body.customerName,
    email: req.body.email,
    items: req.session.cart.map((item) => ({
      product: item.id,
      name: item.name,
      quantity: item.quantity,
      price: item.price,
    })),
    total,
  });

  req.session.cart = [];
  res.redirect("/dashboard");
});

module.exports = router;
