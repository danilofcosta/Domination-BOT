import { NextRequest, NextResponse } from "next/server";
import { uploadMediaToTelegram } from "@/lib/telegram/uploadMedia";
import { sessionHasPermission } from "@/lib/session";

const ALLOWED_MIMES = ["image/jpeg", "image/png", "image/gif", "image/webp", "video/mp4", "video/webm", "video/x-matroska", "video/quicktime"];

const MAGIC: [number[], string][] = [
  [[0xFF, 0xD8, 0xFF], "image/jpeg"],
  [[0x89, 0x50, 0x4E, 0x47], "image/png"],
  [[0x47, 0x49, 0x46, 0x38], "image/gif"],
  [[0x52, 0x49, 0x46, 0x46], "image/webp"], // RIFF....WEBP
  [[0x00, 0x00, 0x00], "video/mp4"],        // ftyp box
  [[0x1A, 0x45, 0xDF, 0xA3], "video/webm"], // EBML
  [[0x00, 0x00, 0x00, 0x14, 0x66, 0x74, 0x79, 0x70, 0x71, 0x74, 0x20, 0x20], "video/quicktime"],
];

function detectMime(buffer: Buffer): string | null {
  for (const [magic, mime] of MAGIC) {
    if (buffer.length >= magic.length && magic.every((b, i) => buffer[i] === b)) {
      if (mime === "video/mp4") {
        const ftyp = buffer.toString("ascii", 4, 8);
        if (ftyp === "ftyp") return "video/mp4";
        return null;
      }
      if (mime === "image/webp") {
        if (buffer.length > 12 && buffer.toString("ascii", 8, 12) === "WEBP") return "image/webp";
        return null;
      }
      return mime;
    }
  }
  return null;
}

export async function POST(request: NextRequest) {
  try {
    if (!(await sessionHasPermission("manage_characters"))) {
      return NextResponse.json(
        { success: false, message: "Não autorizado." },
        { status: 403 },
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const type = formData.get("type") as string | null;

    if (!file || !type) {
      return NextResponse.json(
        { success: false, message: "Arquivo e tipo são obrigatórios" },
        { status: 400 },
      );
    }

    if (file.size > 30 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, message: `Arquivo muito grande: ${(file.size / 1024 / 1024).toFixed(1)}MB (máx 30MB)` },
        { status: 400 },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const detectedMime = detectMime(buffer);

    if (!detectedMime || !detectedMime.startsWith("image/") && !detectedMime.startsWith("video/")) {
      return NextResponse.json(
        { success: false, message: "Formato de arquivo não suportado. Envie uma imagem ou vídeo válido." },
        { status: 400 },
      );
    }

    const isVideo = detectedMime.startsWith("video/");
    const { fileId } = await uploadMediaToTelegram(buffer, file.name, type as "waifu" | "husbando");

    return NextResponse.json({
      success: true,
      fileId,
      mimeType: detectedMime,
      message: "Upload realizado com sucesso",
    });
  } catch (error) {
    console.error("upload error:", error);
    return NextResponse.json(
      { success: false, message: "Erro interno no upload." },
      { status: 500 },
    );
  }
}
