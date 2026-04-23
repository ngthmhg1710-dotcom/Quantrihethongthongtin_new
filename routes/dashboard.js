const express = require("express");
const Order = require("../models/Order");

const router = express.Router();

router.get("/dashboard", async (req, res) => {
  if (!req.session.user) return res.redirect("/auth");
  const orders = await Order.find({ email: req.session.user.email }).sort({ createdAt: -1 });
  res.render("dashboard", { title: "Customer Dashboard", user: req.session.user, orders });
});

module.exports = router;
