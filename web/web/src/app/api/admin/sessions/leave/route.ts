import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { groupId } = body;

    if (!groupId) {
      return NextResponse.json({ error: "groupId é obrigatório" }, { status: 400 });
    }

    return NextResponse.json({ 
      success: true, 
      message: "Implementar lógica para sair do grupo via Bot API" 
    });
  } catch (error) {
    console.error("Erro ao sair do grupo:", error);
    return NextResponse.json({ error: "Erro ao processar solicitação" }, { status: 500 });
  }
}
