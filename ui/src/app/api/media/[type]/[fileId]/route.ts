import { NextResponse } from "next/server";

const TELEGRAM_API = "https://api.telegram.org";

function getBotToken(type: string) {
  return type === "husbando"
    ? process.env.BOT_TOKEN_HUSBANDO
    : process.env.BOT_TOKEN_WAIFU;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ type: string; fileId: string }> },
) {
  const { type, fileId } = await params;

  if (type !== "waifu" && type !== "husbando") {
    return NextResponse.json({ error: "Tipo inválido." }, { status: 400 });
  }

  const token = getBotToken(type);
  if (!token) {
    return NextResponse.json(
      { error: "Bot não configurado." },
      { status: 500 },
    );
  }

  if (!/^[A-Za-z0-9:_\-]+$/.test(fileId)) {
    return NextResponse.json({ error: "Identificador inválido." }, { status: 400 });
  }

  try {
    const fileInfo = await fetch(
      `${TELEGRAM_API}/bot${token}/getFile?file_id=${encodeURIComponent(fileId)}`,
      { cache: "no-store" },
    );
    if (!fileInfo.ok) {
      return NextResponse.json({ error: "Arquivo não encontrado." }, { status: 404 });
    }

    const data = await fileInfo.json();
    const filePath = data?.result?.file_path as string | undefined;
    if (!filePath) {
      return NextResponse.json({ error: "Arquivo indisponível." }, { status: 404 });
    }

    const fileResponse = await fetch(
      `${TELEGRAM_API}/file/bot${token}/${filePath}`,
      { cache: "no-store" },
    );
    if (!fileResponse.ok || !fileResponse.body) {
      return NextResponse.json({ error: "Falha ao baixar arquivo." }, { status: 502 });
    }

    return new Response(fileResponse.body, {
      headers: {
        "Content-Type":
          fileResponse.headers.get("content-type") ?? "application/octet-stream",
        "Content-Length": fileResponse.headers.get("content-length") ?? "",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch {
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}
