import express from "express";
import multer from "multer";
import crypto from "crypto";
import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { r2 } from "../services/r2.js";
import GiftLink from "../models/GiftLink.js";
import authMiddleware from "../middleware/authMiddleware.js";

const upload = multer();
const router = express.Router();

// 🔹 Criar GiftLink
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

// 🔹 Ativar
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

// 🔹 Revogar
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

// 🔹 Gravar áudio
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
    console.error("Erro ao gravar áudio:", err);
    res.status(500).json({ error: "Erro ao gravar áudio" });
  }
});

// 🔹 Listar todos (painel admin)
router.get("/", authMiddleware, async (req, res) => {
  try {
    const links = await GiftLink.find().sort({ createdAt: -1 });
    res.json(links);
  } catch (err) {
    console.error("Erro ao listar GiftLinks:", err);
    res.status(500).json({ error: "Erro ao listar GiftLinks" });
  }
});

// 🔹 Obter dados do link
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
      theme: link.theme || "padrao", // ← agora vem o tema também
    });
  } catch (err) {
    console.error("Erro ao buscar GiftLink:", err);
    res.status(500).json({ error: "Erro ao buscar GiftLink" });
  }
});

// Atualizar o tema do GiftLink
router.patch("/:id/theme", authMiddleware, async (req, res) => {
  try {
    const { theme } = req.body;

    const validThemes = ["default", "natal", "romantico", "aniversario"];
    if (!validThemes.includes(theme)) {
      return res.status(400).json({ error: "Tema inválido" });
    }

    const link = await GiftLink.findOneAndUpdate(
      { linkId: req.params.id },
      { theme },
      { new: true }
    );

    if (!link) return res.status(404).json({ error: "GiftLink não encontrado" });

    res.json(link);
  } catch (err) {
    console.error("Erro ao atualizar tema:", err);
    res.status(500).json({ error: "Erro ao atualizar tema" });
  }
});


// 🔹 Excluir links
router.post("/delete", authMiddleware, async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids)) {
      return res.status(400).json({ error: "IDs inválidos" });
    }

    const links = await GiftLink.find({ _id: { $in: ids } });

    for (const link of links) {
      if (link.audioUrl) {
        try {
          await r2.send(
            new DeleteObjectCommand({
              Bucket: process.env.CLOUDFLARE_R2_BUCKET,
              Key: link.audioUrl,
            })
          );
          console.log(`🗑️ Áudio deletado do R2: ${link.audioUrl}`);
        } catch (err) {
          console.error(`⚠️ Falha ao excluir áudio ${link.audioUrl}:`, err);
        }
      }
    }

    await GiftLink.deleteMany({ _id: { $in: ids } });

    res.json({ success: true });
  } catch (err) {
    console.error("Erro ao excluir links:", err);
    res.status(500).json({ error: "Erro ao excluir links" });
  }
});

export default router;
