const path = require("path");
const express = require("express");
const methodOverride = require("method-override");
const session = require("express-session");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

dotenv.config();
mongoose.set("bufferCommands", false);
mongoose.set("bufferTimeoutMS", 0);

const app = express();
const PORT = process.env.PORT || 3000;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));
app.use(
  session({
    secret: process.env.SESSION_SECRET || "dev-secret",
    resave: false,
    saveUninitialized: true,
  })
);
app.use(express.static(path.join(__dirname, "public")));

app.use((req, res, next) => {
  if (!req.session.cart) {
    req.session.cart = [];
  }
  res.locals.cartCount = req.session.cart.reduce((acc, item) => acc + item.quantity, 0);
  next();
});

app.use((req, res, next) => {
  res.locals.dbReady = app.locals.dbReady;
  next();
});

app.use((req, res, next) => {
  const dbRequiredPrefixes = ["/products", "/cart/add", "/checkout", "/dashboard", "/admin"];
  const needsDb = dbRequiredPrefixes.some((prefix) => req.path.startsWith(prefix));
  if (needsDb && !app.locals.dbReady) {
    return res.status(503).render("db-unavailable", {
      title: "Database Unavailable",
      message: "MongoDB is not connected. Please check MONGODB_URI and MongoDB service.",
    });
  }
  return next();
});

app.use("/", require("./routes/site"));
app.use("/", require("./routes/auth"));
app.use("/", require("./routes/shop"));
app.use("/", require("./routes/dashboard"));
app.use("/", require("./routes/admin"));

app.use((req, res) => {
  res.status(404).render("not-found", { title: "Page Not Found" });
});

async function startServer() {
  app.locals.dbReady = await connectDB();

  mongoose.connection.on("connected", () => {
    app.locals.dbReady = true;
  });
  mongoose.connection.on("disconnected", () => {
    app.locals.dbReady = false;
  });

  app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
