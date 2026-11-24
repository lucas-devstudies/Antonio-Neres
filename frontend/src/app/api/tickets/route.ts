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
 *     description: Cria um ticket público com status inicial TO_DO. O valor é definido pelo pacote no backend.
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
 *                 enum: [ONLINE, PRESENTIAL, PRESENTIAL_PREMIUM]
 *               motive:
 *                 type: string
 *               indication:
 *                 type: string
 *     responses:
 *       201:
 *         description: Ticket criado com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Cadastro realizado com sucesso.
 *                 ticket:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     name:
 *                       type: string
 *                     bundle:
 *                       type: string
 *                     amount:
 *                       type: integer
 *                       description: Valor do pacote em centavos.
 *                     status:
 *                       type: string
 *                       enum: [TO_DO]
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Dados inválidos ou incompletos.
 *       500:
 *         description: Erro interno do servidor.
 */
export async function POST(request: Request) {
  try {
    let body: Record<string, unknown>;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "JSON inválido." },
        { status: 400 }
      );
    }

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

    const email = (body.email as string).trim();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "E-mail inválido." },
        { status: 400 }
      );
    }

    const bundleId = (body.bundle as string).trim();

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
        city: (body.city as string).trim(),
        name: (body.name as string).trim(),
        email,
        address: (body.address as string).trim(),
        degree: (body.degree as string).trim(),
        phone: (body.phone as string).trim(),
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
 *     description: Retorna todos os tickets ativos, incluindo dados completos, administrador responsável pela última atualização e observação associada. Requer autenticação.
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Tickets recuperados com sucesso.
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
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                       updatedById:
 *                         type: string
 *                         nullable: true
 *                       city:
 *                         type: string
 *                       name:
 *                         type: string
 *                       email:
 *                         type: string
 *                         format: email
 *                       address:
 *                         type: string
 *                       degree:
 *                         type: string
 *                       phone:
 *                         type: string
 *                       bundle:
 *                         type: string
 *                       amount:
 *                         type: integer
 *                         description: Valor em centavos.
 *                       motive:
 *                         type: string
 *                         nullable: true
 *                       indication:
 *                         type: string
 *                         nullable: true
 *                       status:
 *                         type: string
 *                         enum: [TO_DO, IN_PROGRESS, DONE]
 *                       position:
 *                         type: integer
 *                       deleted:
 *                         type: boolean
 *                         example: false
 *                       updatedBy:
 *                         type: object
 *                         nullable: true
 *                         properties:
 *                           id:
 *                             type: string
 *                           name:
 *                             type: string
 *                           email:
 *                             type: string
 *                             format: email
 *                       ticketNote:
 *                         type: object
 *                         nullable: true
 *                         properties:
 *                           id:
 *                             type: string
 *                             format: uuid
 *                           ticketId:
 *                             type: string
 *                             format: uuid
 *                           comment:
 *                             type: string
 *                           updatedById:
 *                             type: string
 *                             nullable: true
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                           updatedAt:
 *                             type: string
 *                             format: date-time
 *                           updatedBy:
 *                             type: object
 *                             nullable: true
 *                             properties:
 *                               id:
 *                                 type: string
 *                               name:
 *                                 type: string
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
        { status: "asc" },
        { position: "asc" },
        { createdAt: "asc" },
        { id: "asc" },
      ],
      include: {
        updatedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        ticketNote: {
          include: {
            updatedBy: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

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