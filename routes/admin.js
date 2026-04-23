const express = require("express");
const Product = require("../models/Product");
const Order = require("../models/Order");

const router = express.Router();

function requireAdmin(req, res, next) {
  if (!req.session.user || req.session.user.role !== "admin") return res.redirect("/auth");
  next();
}

router.get("/admin", requireAdmin, async (req, res) => {
  const [products, orders] = await Promise.all([Product.find(), Order.find().sort({ createdAt: -1 })]);
  const revenue = orders.reduce((acc, order) => acc + order.total, 0);
  res.render("admin", { title: "Admin Dashboard", products, orders, revenue });
});

router.post("/admin/products", requireAdmin, async (req, res) => {
  const slug = req.body.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  await Product.create({ ...req.body, slug, badges: req.body.badges.split(",").map((v) => v.trim()) });
  res.redirect("/admin");
});

router.delete("/admin/products/:id", requireAdmin, async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  res.redirect("/admin");
});

module.exports = router;
