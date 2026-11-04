import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import { errorHandler } from "./middleware/error-handler";
import { ordersRouter } from "./routes/orders";
import { servicesRouter } from "./routes/services";
import bookingsRouter from "./routes/bookings";
import adminRouter from "./routes/admin";
import technicianRouter from "./routes/technician";
import expansionRouter from "./routes/expansion";
import { initializeRabbitMQ } from "./config/rabbitmq";

const app = express();
const port = process.env.PORT || 3003;

// Middleware
app.use(helmet());
const origins=(process.env.CORS_ORIGINS || "http://localhost:3000,http://localhost:3010,http://localhost:3020,http://admin.localhost,http://technician.localhost")
  .split(",").map(x=>x.trim()).filter(Boolean);
app.use(cors({ origin: origins, methods:["GET","POST","PUT","PATCH","DELETE","OPTIONS"], allowedHeaders:["Authorization","Content-Type"] }));
app.use(morgan("dev"));
app.use(express.json());

// Health check - MUST be before authenticated routes
app.get("/api/orders/health", (_req, res) => {
  res.json({ status: "healthy", service: "orders" });
});

// Routes - specific routes MUST come before generic ones
// Otherwise /api/orders/bookings would match ordersRouter's /:id route
app.use("/api/orders/bookings", bookingsRouter);
app.use("/api/orders/expansions", expansionRouter);
app.use("/api/orders/admin", adminRouter);
app.use("/api/orders/technician", technicianRouter);
app.use("/api/orders/services", servicesRouter);
app.use("/api/orders", ordersRouter);

// Error handler
app.use(errorHandler);

// RabbitMQ is optional for COD-only orders. A missing payment message broker
// must never prevent the booking and admin REST APIs from starting.
async function start() {
  app.listen(Number(port), "0.0.0.0", () => {
    console.log(`Orders service running on port ${port}`);
  });
  if (process.env.RABBITMQ_URL) {
    try {
      await initializeRabbitMQ();
      console.log("Connected to RabbitMQ");
    } catch (error) {
      console.error("RabbitMQ unavailable; COD REST operations remain available:", error);
    }
  } else {
    console.log("RabbitMQ disabled: cash-on-delivery only; payment event processing unavailable.");
  }
}
void start();
