import { NextResponse } from "next/server";
import {
  WebhookSignatureValidator,
  InvalidWebhookSignatureError,
} from "mercadopago";

export async function POST(request: Request) {
  const url = new URL(request.url);
  const type = url.searchParams.get("type");
  const dataId = url.searchParams.get("data.id");

  if (type !== "payment" || !dataId) {
    return NextResponse.json({ received: true });
  }

  const secret = process.env.MP_WEBHOOK_SECRET;

  if (!secret) {
    console.error("MP_WEBHOOK_SECRET não configurado.");

    return NextResponse.json(
      { error: "Configuração do webhook ausente." },
      { status: 500 }
    );
  }

  try {
    WebhookSignatureValidator.validate({
      xSignature: request.headers.get("x-signature") ?? "",
      xRequestId: request.headers.get("x-request-id") ?? "",
      dataId,
      secret,
      toleranceSeconds: 300,
    });

    return NextResponse.json({
      received: true,
      signatureValid: true,
    });
  } catch (error) {
    if (error instanceof InvalidWebhookSignatureError) {
      return NextResponse.json(
        { error: "Assinatura inválida." },
        { status: 401 }
      );
    }

    console.error("Erro ao validar assinatura do webhook.");

    return NextResponse.json(
      { error: "Não foi possível validar a notificação." },
      { status: 500 }
    );
  }
}