const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");
const taskRoutes = require("./routes/taskRoutes");

const app = express();

const isProduction = process.env.NODE_ENV === "production";

// Local dev origins are always allowed; CLIENT_URL supplies the deployed
// frontend (e.g. Vercel) and may hold a comma-separated list for previews.
const localOrigins = ["http://localhost:5173", "http://127.0.0.1:5173"];
const configuredOrigins = (process.env.CLIENT_URL || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
const allowedOrigins = [...new Set([...localOrigins, ...configuredOrigins])];

const corsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser requests (curl, health checks) which send no origin.
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`Not allowed by CORS: ${origin}`));
  },
};

app.use(helmet());
app.use(compression());
if (!isProduction) {
  app.use(morgan("dev"));
}
app.use(cors(corsOptions));
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Task Tracker API is running" });
});

app.use("/api/tasks", taskRoutes);

// 404 handler for unmatched routes
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// Global error handler (must have 4 args to be recognized by Express)
app.use((err, req, res, next) => {
  if (err.message && err.message.startsWith("Not allowed by CORS")) {
    return res.status(403).json({ success: false, message: "Not allowed by CORS" });
  }
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Server error",
  });
});

module.exports = app;
