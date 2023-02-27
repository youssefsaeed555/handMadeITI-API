//requires
const auth = require("./authServices");
const userServices = require("./userServices");
const productRoute = require("./productRoute");
const categoryRoutes = require("./categoryRoutes");
const wishlistRoutes = require("./wishlistRoutes");
const addressRoutes = require("./addressRoutes");
const reviewsRoutes = require("./reviewsRoutes");
const cartRoutes = require("./cartRoutes");
const orderRoutes = require("./orderRoutes");

const mountRoutes = (app) => {
  //mounting routes
  app.use("/api/v1/auth", auth);
  app.use("/api/v1/user", userServices);
  app.use("/api/v1/categories", categoryRoutes);
  app.use("/api/v1/products", productRoute);
  app.use("/api/v1/wishlist", wishlistRoutes);
  app.use("/api/v1/addresses", addressRoutes);
  app.use("/api/v1/review", reviewsRoutes);
  app.use("/api/v1/cart", cartRoutes);
  app.use("/api/v1/orders", orderRoutes);
};

module.exports = mountRoutes;
