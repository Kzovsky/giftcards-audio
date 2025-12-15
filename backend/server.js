import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";
import authRoutes from "./routes/auth.js";
import giftLinksRoutes from "./routes/giftLinks.js";
import cardsRoutes from "./routes/cards.js";

const allowedOrigins = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "https://giftcards-audio.vercel.app",
  /\.vercel\.app$/,
  /https?:\/\/.*\.onrender\.com$/,
];

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, ".env") });

const app = express();


app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      const allowed = allowedOrigins.some((o) => {
        if (o instanceof RegExp) return o.test(origin);
        return o === origin;
      });
      if (allowed) return callback(null, true);
      return callback(new Error("CORS blocked"), false);
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  })
);


app.use((req, res, next) => {
  const requestOrigin = req.headers.origin;
  const isAllowed = !!allowedOrigins.find((o) => {
    if (!requestOrigin) return false;
    if (o instanceof RegExp) return o.test(requestOrigin);
    return o === requestOrigin;
  });

  if (isAllowed) {
    res.header("Access-Control-Allow-Origin", requestOrigin);
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.header("Access-Control-Allow-Credentials", "true");
  }

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  next();
});

app.use(express.json({ type: "application/json" }));




app.use(express.json({ type: "application/json" }));


app.use("/api/auth", authRoutes);
app.use("/api/gift-links", giftLinksRoutes);
app.use("/api/cards", cardsRoutes);


app.use((err, req, res, next) => {
  if (err.message === "CORS bloqueado") {
    return res.status(403).json({ message: "CORS bloqueado para esta origem." });
  }
  console.error("Erro no servidor:", err);
  res.status(500).json({ message: "Erro interno do servidor." });
});

const PORT = process.env.PORT || 4000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB conectado");
    console.log(
      "🌍 R2 endpoint:",
      process.env.CLOUDFLARE_R2_ENDPOINT ? "OK" : "MISSING"
    );
    console.log(
      "🔑 Access key:",
      process.env.CLOUDFLARE_ACCESS_KEY_ID ? "OK" : "MISSING"
    );
    console.log(
      "🔒 Secret key:",
      process.env.CLOUDFLARE_SECRET_ACCESS_KEY ? "OK" : "MISSING"
    );
    app.listen(PORT, () =>
      console.log(`🚀 Servidor rodando na porta ${PORT}`)
    );
  })
  .catch((err) => console.error("Erro ao conectar no MongoDB:", err));
