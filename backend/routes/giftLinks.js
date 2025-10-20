// routes/giftLinks.js
import express from "express";
import multer from "multer";
import crypto from "crypto";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { r2 } from "../services/r2.js";
import GiftLink from "../models/GiftLink.js";
import authMiddleware from "../middleware/authMiddleware.js";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
const upload = multer();
const router = express.Router();

/**
 * Criar novo GiftLink
 */
router.post("/", authMiddleware, async (req, res) => {
  try {
    const link = new GiftLink({
      linkId: crypto.randomUUID(),
      status: "PENDING_VALIDATION"
    });
    await link.save();
    res.json(link);
  } catch (err) {
    console.error("Erro ao criar GiftLink:", err);
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
    console.error("Erro ao ativar GiftLink:", err);
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
    console.error("Erro ao revogar GiftLink:", err);
    res.status(500).json({ error: "Erro ao revogar GiftLink" });
  }
});

/**
 * Upload de áudio (público)
 */
// routes/giftLinks.js
router.post("/:id/record", upload.single("audio"), async (req, res) => {
  try {
    console.log("🎧 Upload recebido para:", req.params.id);

    const link = await GiftLink.findOne({ linkId: req.params.id });
    if (!link) return res.status(404).json({ error: "GiftLink não encontrado" });

    if (link.status !== "VALIDATED")
      return res.status(400).json({ error: "Link não está validado para gravação" });

    if (!req.file) return res.status(400).json({ error: "Nenhum arquivo enviado" });

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
    console.error("❌ Erro ao gravar áudio:", err);
    res.status(500).json({ error: "Erro ao gravar áudio" });
  }
});


router.get("/", authMiddleware, async (req, res) => {
  try {
    const links = await GiftLink.find().sort({ createdAt: -1 });
    res.json(links);
  } catch (err) {
    console.error("Erro ao listar GiftLinks:", err);
    res.status(500).json({ error: "Erro ao listar GiftLinks" });
  }
});
router.get("/:id", async (req, res) => {
  try {
    const link = await GiftLink.findOne({ linkId: req.params.id });

    if (!link) {
      return res.status(404).json({ error: "GiftLink não encontrado" });
    }

    res.json({
      linkId: link.linkId,
      status: link.status,
      audioUrl: link.audioUrl || null,
      recordedAt: link.recordedAt || null,
      createdAt: link.createdAt,
    });
  } catch (err) {
    console.error("Erro ao buscar GiftLink:", err);
    res.status(500).json({ error: "Erro ao buscar GiftLink" });
  }
});
router.post("/delete", authMiddleware, async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids)) {
      return res.status(400).json({ error: "IDs inválidos" });
    }

    // Buscar os links no banco antes de excluir
    const links = await GiftLink.find({ _id: { $in: ids } });

    // Para cada link, deletar o arquivo de áudio do R2 se existir
    for (const link of links) {
      if (link.audioUrl) {
        try {
          await r2.send(
            new DeleteObjectCommand({
              Bucket: process.env.CLOUDFLARE_R2_BUCKET,
              Key: link.audioUrl, // ⬅️ É o mesmo caminho que você salva: audios/{linkId}.webm
            })
          );
          console.log(`🗑️ Áudio deletado do R2: ${link.audioUrl}`);
        } catch (err) {
          console.error(`⚠️ Falha ao excluir áudio ${link.audioUrl}:`, err);
        }
      }
    }

    // Agora deletar os registros do MongoDB
    await GiftLink.deleteMany({ _id: { $in: ids } });

    res.json({ success: true });
  } catch (err) {
    console.error("❌ Erro ao excluir links:", err);
    res.status(500).json({ error: "Erro ao excluir links" });
  }
});
export default router;
