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
  "https://giftcards-audio.vercel.app",
];

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, ".env") });

const app = express();


app.use(
  cors({
    origin: ["http://localhost:3000", "https://giftcards-audio.vercel.app"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  })
);

app.use(
  cors({
    origin: (origin, callback) => {
      // Permite requisições sem origin (Postman, server-side)
      if (!origin) return callback(null, true);

      // Libera qualquer domínio *.vercel.app
      if (
        allowedOrigins.includes(origin) ||
        origin.endsWith(".vercel.app")
      ) {
        return callback(null, true);
      }

      return callback(new Error("CORS bloqueado"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Preflight
app.options("*", cors());

// Preflight
app.options("*", cors());


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
