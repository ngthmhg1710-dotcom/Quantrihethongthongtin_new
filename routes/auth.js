const express = require("express");
const User = require("../models/User");

const router = express.Router();

router.get("/auth", (req, res) => {
  const defaultTab = req.query.tab === "signup" ? "signup" : "signin";
  res.render("auth", { title: "Login / Register", error: null, defaultTab });
});

router.post("/auth/login", async (req, res) => {
  const user = await User.findOne({ email: req.body.email, password: req.body.password });
  if (!user) {
    return res.render("auth", { title: "Login / Register", error: "Wrong email or password", defaultTab: "signin" });
  }
  req.session.user = { id: user._id, name: user.fullName, role: user.role, email: user.email };
  res.redirect(user.role === "admin" ? "/admin" : "/dashboard");
});

router.post("/auth/register", async (req, res) => {
  const existing = await User.findOne({ email: req.body.email });
  if (existing) {
    return res.render("auth", { title: "Login / Register", error: "Email already exists", defaultTab: "signup" });
  }

  const user = await User.create({
    fullName: req.body.fullName,
    email: req.body.email,
    password: req.body.password,
  });

  req.session.user = { id: user._id, name: user.fullName, role: user.role, email: user.email };
  res.redirect("/dashboard");
});

router.post("/auth/logout", (req, res) => {
  req.session.destroy(() => res.redirect("/"));
});

module.exports = router;
