require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const { notFound, errorHandler } = require("./middleware/errorHandler");

const productRoutes = require("./routes/productRoutes");
const deliveryZoneRoutes = require("./routes/deliveryZoneRoutes");
const orderRoutes = require("./routes/orderRoutes");
const paymentRoutes = require("./routes/paymentRoutes");

const app = express();

app.set("trust proxy", 1);

// When frontend + backend deploy together as one Vercel project, requests
// arrive same-origin and CORS never triggers. CLIENT_ORIGIN only matters if
// you ever split them across two domains again (or for local dev without
// the Vite proxy) — safe to leave unset otherwise.
if (process.env.CLIENT_ORIGIN) {
  const allowedOrigins = process.env.CLIENT_ORIGIN.split(",")
    .map((o) => o.trim())
    .filter(Boolean);

  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error("Not allowed by CORS"));
        }
      },
      credentials: true,
    })
  );
}

if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

// The Paystack webhook needs the raw request body to verify the HMAC
// signature, so it's registered with express.raw() BEFORE the global
// express.json() parser below.
app.use("/api/payment/webhook", express.raw({ type: "application/json" }));

app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "Belce API", time: new Date().toISOString() });
});

app.use("/api/products", productRoutes);
app.use("/api/delivery-zones", deliveryZoneRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payment", paymentRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
