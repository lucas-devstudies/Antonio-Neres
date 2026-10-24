import { NextResponse } from "next/server";
import { Preference } from "mercadopago";
import { prisma } from "@/lib/prisma";
import { mercadoPago } from "@/lib/mercadopago";
import { courseBundles } from "@/lib/course-bundle";

const paymentMethods = ["PIX", "CREDIT_CARD"] as const;

export async function POST(request: Request) {
  let attemptId: string | undefined;
  let preferenceCreated = false;

  try {
    const body = await request.json();

    const { 
      city,
      name,
      email,
      address,
      degree,
      phone,
      bundle,
      payform,
      motive,
      indication,
    } = body;

    if (        //checagem redundante. Seu que o ZOD impede campos nulos, mas em caso mudemos uma hora, o back verifica também. 
      !city ||
      !name ||
      !email ||
      !address ||
      !degree ||
      !phone ||
      !bundle ||
      !payform
    ) {
      return NextResponse.json(
        { error: "Preencha todos os campos obrigatórios." },
        { status: 400 }
      );
    }

    if (
      typeof bundle !== "string" ||
      !Object.hasOwn(courseBundles, bundle)
    ) {
      return NextResponse.json(
        { error: "Pacote inválido." },
        { status: 400 }
      );
    }

    if (typeof payform !== "string" || !paymentMethods.includes(payform as (typeof paymentMethods)[number])) {
        
      return NextResponse.json(
        { error: "Forma de pagamento inválida." },
        { status: 400 }
      );
    }
    const selectedPaymentMethod = payform as (typeof paymentMethods)[number]; // mudando o payform de string genérica pra comportar o enum

    const selectedBundle =
      courseBundles[bundle as keyof typeof courseBundles];

    const attempt = await prisma.checkoutAttempt.create({
      data: {
        city,
        name,
        email,
        address,
        degree,
        phone,
        bundle,
        payform: selectedPaymentMethod,
        motive: motive || null,
        indication: indication || null,
        expiresAt: new Date(Date.now() + 40 * 60 * 1000),
      },
    });

    attemptId = attempt.id;

    const preferenceClient = new Preference(mercadoPago);
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 30 * 60 * 1000);

    const preference = await preferenceClient.create({
      body: {
        items: [
          {
            id: bundle,
            title: `Pacote ${selectedBundle.name}`,
            quantity: 1,
            currency_id: "BRL",
            unit_price: selectedBundle.price / 100,
          },
        ],

        payment_methods: {
            excluded_payment_types: selectedPaymentMethod === "PIX" // limitando forma de pagamento à que está no formulario
            ? [
                { id: "credit_card" },
                { id: "debit_card" },
                { id: "ticket" },
                ]
            : [
                { id: "bank_transfer" },
                { id: "ticket" },
                ],
        },

        payer: {
          name,
          email,
        },

        external_reference: attempt.id,
        expires: true,
        expiration_date_from: now.toISOString(),
        expiration_date_to: expiresAt.toISOString(),
      },

    });

    preferenceCreated = true;

    if (!preference.id) {
      throw new Error("O Mercado Pago não retornou o ID da preferência.");
    }

    await prisma.checkoutAttempt.update({
      where: { id: attempt.id },
      data: { preferenceId: preference.id },
    });

    const checkoutUrl =
      process.env.NODE_ENV === "production"
        ? preference.init_point
        : preference.sandbox_init_point ?? preference.init_point;

    if (!checkoutUrl) {
      throw new Error("O Mercado Pago não retornou a URL do checkout.");
    }

    return NextResponse.json({
      checkoutUrl,
      preferenceId: preference.id,
    });
  } catch (error) {
    if (attemptId && !preferenceCreated) {
      await prisma.checkoutAttempt
        .delete({ where: { id: attemptId } })
        .catch(() => undefined);
    }

    console.error("Erro ao iniciar checkout:", error);

    return NextResponse.json(
      { error: "Não foi possível iniciar o pagamento." },
      { status: 500 }
    );
  }
}