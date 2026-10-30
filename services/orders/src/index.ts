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

// Start server
async function start() {
  try {
    await initializeRabbitMQ();
    console.log("Connected to RabbitMQ");

    app.listen(port, () => {
      console.log(`Orders service running on port ${port}`);
    });
  } catch (error) {
    console.error("Failed to start orders service:", error);
    process.exit(1);
  }
}

start();
