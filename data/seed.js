const dotenv = require("dotenv");
const mongoose = require("mongoose");
const Product = require("../models/Product");
const User = require("../models/User");

dotenv.config();

const products = [
  {
    name: "Velvet Milky Cleanser",
    slug: "velvet-milky-cleanser",
    description: "Creamy low-foam cleanser for soft and clean skin.",
    price: 32,
    image: "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=800&q=80",
    badges: ["Oily", "Dry"],
  },
  {
    name: "Morning Dew Serum",
    slug: "morning-dew-serum",
    description: "Brightening serum with niacinamide and panthenol.",
    price: 48,
    image: "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=800&q=80",
    badges: ["Dry", "Sensitive"],
  },
  {
    name: "Cloud Plush Moisturizer",
    slug: "cloud-plush-moisturizer",
    description: "Weightless moisturizer that locks hydration all day.",
    price: 42,
    image: "https://images.unsplash.com/photo-1629198688000-71f23e745b6e?auto=format&fit=crop&w=800&q=80",
    badges: ["Oily", "Sensitive"],
  },
  {
    name: "Invisible Solar Shield",
    slug: "invisible-solar-shield",
    description: "SPF 50 invisible sunscreen for daily protection.",
    price: 36,
    image: "https://images.unsplash.com/photo-1625772452859-1c03d5bf1137?auto=format&fit=crop&w=800&q=80",
    badges: ["Sensitive", "Dry"],
  },
];

async function runSeed() {
  if (!process.env.MONGODB_URI) {
    // eslint-disable-next-line no-console
    console.error("Please set MONGODB_URI in .env first.");
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGODB_URI);
  await Product.deleteMany({});
  await User.deleteMany({});
  await Product.insertMany(products);
  await User.create({
    fullName: "Admin Glow",
    email: "admin@glowco.com",
    password: "123456",
    role: "admin",
  });
  await User.create({
    fullName: "Demo User",
    email: "user@glowco.com",
    password: "123456",
    role: "customer",
  });

  // eslint-disable-next-line no-console
  console.log("Seed data inserted");
  await mongoose.disconnect();
}

runSeed().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
