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
  /\.vercel\.app$/, 
];
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, ".env") });

const app = express();

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true); // permite requests sem origin (ex: Postman)
      if (allowedOrigins.some((o) => (o instanceof RegExp ? o.test(origin) : o === origin))) {
        callback(null, true);
      } else {
        console.log(" Bloqueado por CORS:", origin);
        callback(new Error("CORS bloqueado"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  })
);

app.use(express.json({ type: "application/json" }));


app.use("/api/auth", authRoutes);
app.use("/api/gift-links", giftLinksRoutes);
app.use("/api/cards", cardsRoutes);

const PORT = process.env.PORT || 4000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB conectado");
    console.log("🌍 R2 endpoint:", process.env.CLOUDFLARE_R2_ENDPOINT ? "OK" : "MISSING");
    console.log("🔑 Access key:", process.env.CLOUDFLARE_ACCESS_KEY_ID ? "OK" : "MISSING");
    console.log("🔒 Secret key:", process.env.CLOUDFLARE_SECRET_ACCESS_KEY ? "OK" : "MISSING");
    app.listen(PORT, () => console.log(`🚀 Servidor rodando na porta ${PORT}`));
  })
  .catch((err) => console.error("Erro ao conectar no MongoDB:", err));
