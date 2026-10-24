
import { NextResponse } from "next/server";
import {
  Payment,
  WebhookSignatureValidator,
  InvalidWebhookSignatureError,
} from "mercadopago";
import { mercadoPago } from "@/lib/mercadopago";
import { prisma } from "@/lib/prisma";
import { courseBundles } from "@/lib/course-bundle";
import { Prisma } from "@/generated/prisma/client";

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
  } catch (error) {
    if (error instanceof InvalidWebhookSignatureError) {
      return NextResponse.json(
        { error: "Assinatura inválida." },
        { status: 401 }
      );
    }

    console.error("Erro ao validar a assinatura do webhook.");

    return NextResponse.json(
      { error: "Não foi possível validar a notificação." },
      { status: 500 }
    );
  }

  try {
    const paymentClient = new Payment(mercadoPago);
    const payment = await paymentClient.get({ id: dataId });

    console.log("Pagamento recebido:", {
      id: payment.id,
      status: payment.status,
      external_reference: payment.external_reference,
      payment_method_id: payment.payment_method_id,
      payment_type_id: payment.payment_type_id,
    });

    if (payment.status !== "approved") {
      return NextResponse.json({
        received: true,
        ticketCreated: false,
        reason: "payment_not_approved",
      });
    }

    if (
      !payment.external_reference ||
      payment.id == null ||
      payment.transaction_amount == null ||
      !payment.payment_method_id
    ) {
      return NextResponse.json(
        { error: "Dados do pagamento incompletos." },
        { status: 400 }
      );
    }

    const attempt = await prisma.checkoutAttempt.findUnique({
      where: {
        id: payment.external_reference,
      },
    });

    if (!attempt) {
      const existingTicket = await prisma.ticket.findUnique({
        where: {
          mercadoPagoId: String(payment.id),
        },
      });

      if (existingTicket) {
        return NextResponse.json({
          received: true,
          ticketCreated: false,
          reason: "payment_already_processed",
        });
      }

      return NextResponse.json(
        { error: "Tentativa de compra não encontrada." },
        { status: 404 }
      );
    }

    const expectedBundle =
      courseBundles[attempt.bundle as keyof typeof courseBundles];

    if (!expectedBundle) {
      return NextResponse.json(
        { error: "Pacote da compra inválido." },
        { status: 400 }
      );
    }

    if (
      payment.transaction_amount !== expectedBundle.price / 100 ||
      payment.currency_id !== "BRL"
    ) {
      console.error(
        "Valor ou moeda do pagamento não corresponde à compra."
      );

      return NextResponse.json(
        { error: "Dados do pagamento não correspondem à compra." },
        { status: 400 }
      );
    }

    await prisma.$transaction(async (tx) => {
      await tx.ticket.create({
        data: {
          city: attempt.city,
          name: attempt.name,
          email: attempt.email,
          address: attempt.address,
          degree: attempt.degree,
          phone: attempt.phone,
          bundle: attempt.bundle,
          payform: payment.payment_method_id!,
          amount: new Prisma.Decimal(payment.transaction_amount!),
          motive: attempt.motive,
          indication: attempt.indication,
          status: "IN_PROGRESS",
          mercadoPagoId: String(payment.id),
        },
      });

      await tx.checkoutAttempt.delete({
        where: {
          id: attempt.id,
        },
      });
    });

    return NextResponse.json({
      received: true,
      ticketCreated: true,
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json({
        received: true,
        ticketCreated: false,
        reason: "payment_already_processed",
      });
    }

    console.error(
      "Erro ao processar pagamento e registrar ticket:",
      error
    );

    return NextResponse.json(
      { error: "Não foi possível processar o pagamento." },
      { status: 500 }
    );
  }
}
