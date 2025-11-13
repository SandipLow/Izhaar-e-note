import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import { createServer } from "http";
import expressLayouts from "express-ejs-layouts";
import path from "path";
import notesRouter from "./routes/notes";
import cron from "node-cron";
import axios from "axios";


const app = express();
const PORT = parseInt(process.env.PORT || "3000");

// Create HTTP server
const server = createServer(app);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (CSS, JS, images, etc.)
app.use(express.static(path.join(__dirname, "..", "public")));

// Set EJS as the view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "..", "views"));

app.use(expressLayouts);
app.set("layout", "layout")

// Routes
app.get("/", (req, res) => {
    res.render("index");
});

app.get("/health", (req, res) => {
    res.status(200).send("OK");
});

app.use("/notes", notesRouter);

// Start the HTTP server
server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});


// Schedule cron job to run every day at midnight
cron.schedule("*/10 * * * *", async () => {
    console.log("Running scheduled self-ping...");
    await axios.get(process.env.BACKEND_URI || `http://localhost:${PORT}` + "/health");
});
