import express from "express";
import { PDFDocument, rgb } from "pdf-lib";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import * as fontkit from "fontkit";
const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

router.post("/generate", async (req, res) => {
  try {
    const { message, musicUrl, linkId } = req.body;

    // cria um PDF vazio
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([600, 400]);
  pdfDoc.registerFontkit(fontkit); 
    // carrega fonte Unicode
    const fontPath = path.join(__dirname, "../assets/fonts/NotoSans-Regular.ttf");
    const fontBytes = fs.readFileSync(fontPath);
    const customFont = await pdfDoc.embedFont(fontBytes);

    // fundo suave
    page.drawRectangle({
      x: 0,
      y: 0,
      width: 600,
      height: 400,
      color: rgb(0.95, 0.9, 1),
    });

    // título
    page.drawText("💌 Cartão Personalizado", {
      x: 180,
      y: 350,
      size: 18,
      font: customFont,
      color: rgb(0.4, 0.1, 0.6),
    });

    // mensagem
    page.drawText(message || "Sem mensagem", {
      x: 50,
      y: 300,
      size: 14,
      font: customFont,
      color: rgb(0.1, 0.1, 0.1),
    });

    // link da música
    if (musicUrl) {
      page.drawText(`🎵 Música: ${musicUrl}`, {
        x: 50,
        y: 260,
        size: 12,
        font: customFont,
        color: rgb(0, 0.2, 0.5),
      });
    }

    // QR code (ou link)
    page.drawText(`🔗 Link: ${process.env.FRONTEND_URL}/g/${linkId}`, {
      x: 50,
      y: 220,
      size: 12,
      font: customFont,
      color: rgb(0.2, 0.2, 0.2),
    });

    // exporta PDF
    const pdfBytes = await pdfDoc.save();
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="cartao-${linkId}.pdf"`);
    res.send(Buffer.from(pdfBytes));
  } catch (err) {
    console.error("❌ Erro ao gerar cartão:", err);
    res.status(500).json({ error: "Erro ao gerar o cartão", details: err.message });
  }
});

export default router;
