require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const connectDB = require("./config/db");
const logger = require("./middleware/logger");
const errorHandler = require("./middleware/errorHandler");

const app = express();

app.use(express.json());
app.use(morgan("dev"));
app.use(logger);
app.use(cors({ origin: process.env.CORS_ORIGIN || "*" }));

app.get("/", (req, res) => res.send("Server is running"));

// Mount API routers (placeholders; created in routes/)
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/hospitals", require("./routes/hospitals"));
app.use("/api/doctors", require("./routes/doctors"));
app.use("/api/appointments", require("./routes/appointments"));
app.use("/api/ai", require("./routes/ai"));
app.use("/api/admin", require("./routes/admin"));
app.use("/api/specializations", require("./routes/specializations"));

app.use(errorHandler);

const start = async () => {
  try {
    await connectDB();
    const port = process.env.PORT || 5000;
    app.listen(port, () => console.log(`Server running on port ${port}`));
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
};

start();