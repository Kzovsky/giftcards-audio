import express from "express";
import multer from "multer";
import crypto from "crypto";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { r2 } from "../services/r2.js";
import GiftLink from "../models/GiftLink.js";
import authMiddleware from "../middleware/authMiddleware.js";

const upload = multer(); // salva arquivos em memória
const router = express.Router();

/**
 * Criar novo GiftLink
 */
router.post("/", authMiddleware, async (req, res) => {
  try {
    const link = new GiftLink({
      linkId: crypto.randomUUID(),
      status: "PENDING_VALIDATION",
    });
    await link.save();
    res.json(link);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao criar GiftLink" });
  }
});

/**
 * Ativar GiftLink
 */
router.post("/:id/activate", authMiddleware, async (req, res) => {
  try {
    const link = await GiftLink.findOne({ linkId: req.params.id });
    if (!link) return res.status(404).json({ error: "GiftLink não encontrado" });

    link.status = "VALIDATED";
    await link.save();
    res.json(link);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao ativar GiftLink" });
  }
});

/**
 * Revogar GiftLink
 */
router.post("/:id/revoke", authMiddleware, async (req, res) => {
  try {
    const link = await GiftLink.findOne({ linkId: req.params.id });
    if (!link) return res.status(404).json({ error: "GiftLink não encontrado" });

    link.status = "REVOKED";
    await link.save();
    res.json(link);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao revogar GiftLink" });
  }
});

/**
 * Upload de áudio para o GiftLink
 */
router.post("/:id/record", upload.single("audio"), async (req, res) => {
  try {
    const link = await GiftLink.findOne({ linkId: req.params.id });
    if (!link) return res.status(404).json({ error: "GiftLink não encontrado" });
    if (link.status !== "VALIDATED")
      return res.status(400).json({ error: "Link não está validado para gravação" });

    const key = `audios/${link.linkId}.webm`;

    await r2.send(
      new PutObjectCommand({
        Bucket: process.env.CLOUDFLARE_R2_BUCKET,
        Key: key,
        Body: req.file.buffer,
        ContentType: "audio/webm",
      })
    );

    link.audioUrl = key;
    link.status = "RECORDED";
    link.recordedAt = new Date();
    await link.save();

    res.json({ success: true, audioUrl: key });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao gravar áudio" });
  }
});

/**
 * Retornar URL do áudio para playback
 */
// Listar todos os giftlinks
router.get("/", authMiddleware, async (req, res) => {
  try {
    const links = await GiftLink.find().sort({ createdAt: -1 });
    res.json(links);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao listar GiftLinks" });
  }
});

// ROTA PÚBLICA: retorna o GiftLink pelo linkId
router.get("/:linkId", async (req, res) => {
  const link = await GiftLink.findOne({ linkId: req.params.linkId });
  if (!link) return res.status(404).json({ error: "Link não encontrado" });
  res.json(link);
});

export default router;
