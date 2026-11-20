import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { courseBundles } from "@/lib/course-bundle";



/**
 * @swagger
 * /api/tickets:
 *   post:
 *     tags:
 *       - Tickets
 *     summary: Cadastrar um novo ticket
 *     description: Cria diretamente um ticket com status TO_DO.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - city
 *               - name
 *               - email
 *               - address
 *               - degree
 *               - phone
 *               - bundle
 *             properties:
 *               city:
 *                 type: string
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               address:
 *                 type: string
 *               degree:
 *                 type: string
 *               phone:
 *                 type: string
 *               bundle:
 *                 type: string
 *                 description: Identificador definido em courseBundles.
 *               motive:
 *                 type: string
 *               indication:
 *                 type: string
 *     responses:
 *       201:
 *         description: Ticket criado com sucesso.
 *       400:
 *         description: Dados inválidos ou incompletos.
 *       500:
 *         description: Erro interno do servidor.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json(
        { error: "Dados inválidos." },
        { status: 400 }
      );
    }

    const requiredFields = [
      "city",
      "name",
      "email",
      "address",
      "degree",
      "phone",
      "bundle",
    ] as const;

    for (const field of requiredFields) {
      if (
        typeof body[field] !== "string" ||
        !body[field].trim()
      ) {
        return NextResponse.json(
          { error: `Campo obrigatório inválido: ${field}.` },
          { status: 400 }
        );
      }
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email.trim())) {
      return NextResponse.json(
        { error: "E-mail inválido." },
        { status: 400 }
      );
    }

    const bundleId = body.bundle.trim();

    if (!Object.prototype.hasOwnProperty.call(courseBundles, bundleId)) {
      return NextResponse.json(
        { error: "Pacote selecionado inválido." },
        { status: 400 }
      );
    }

    const bundle = courseBundles[
      bundleId as keyof typeof courseBundles
    ];

    const ticket = await prisma.ticket.create({
      data: {
        city: body.city.trim(),
        name: body.name.trim(),
        email: body.email.trim(),
        address: body.address.trim(),
        degree: body.degree.trim(),
        phone: body.phone.trim(),
        bundle: bundleId,
        amount: bundle.price,
        motive:
          typeof body.motive === "string"
            ? body.motive.trim()
            : "",
        indication:
          typeof body.indication === "string"
            ? body.indication.trim()
            : "",
        status: "TO_DO",
      },
      select: {
        id: true,
        name: true,
        bundle: true,
        amount: true,
        status: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      {
        message: "Cadastro realizado com sucesso.",
        ticket,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erro ao criar ticket:", error);

    return NextResponse.json(
      { error: "Erro interno ao realizar o cadastro." },
      { status: 500 }
    );
  }
}


/**
 * @swagger
 * /api/tickets:
 *   get:
 *     tags:
 *       - Tickets
 *     summary: Listar tickets
 *     description: Retorna tickets não excluídos, ordenados por posição e data de criação. Requer sessão autenticada.
 *     responses:
 *       200:
 *         description: Lista recuperada com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 tickets:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                       name:
 *                         type: string
 *                       city:
 *                         type: string
 *                       email:
 *                         type: string
 *                       phone:
 *                         type: string
 *                       bundle:
 *                         type: string
 *                       amount:
 *                         type: string
 *                         description: Valor monetário retornado pelo Prisma Decimal.
 *                       status:
 *                         type: string
 *                         enum: [TO_DO, IN_PROGRESS, DONE]
 *                       position:
 *                         type: integer
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *       401:
 *         description: Sessão ausente ou inválida.
 *       500:
 *         description: Erro interno ao consultar tickets.
 */
export async function GET(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json(
        { error: "Acesso não autorizado." },
        { status: 401 }
      );
    }

    const tickets = await prisma.ticket.findMany({
      where: {
        deleted: false,
      },
      orderBy: [
        { position: "asc" },
        { createdAt: "asc" },
      ],
      select: {
        id: true,
        name: true,
        city: true,
        email: true,
        phone: true,
        bundle: true,
        amount: true,
        status: true,
        position: true,
        createdAt: true,
        updatedAt: true,
      },
    });


    console.log("Tickets recuperados do banco:");
    console.log(JSON.stringify(tickets, null, 2));

    return NextResponse.json(
      { tickets },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error("Erro ao consultar tickets:", error);

    return NextResponse.json(
      { error: "Erro interno ao consultar tickets." },
      { status: 500 }
    );
  }
}

