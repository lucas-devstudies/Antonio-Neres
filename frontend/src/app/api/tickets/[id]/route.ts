import { Prisma } from "@/generated/prisma/client";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{ id: string }>;
};




/**
 * @swagger
 * /api/tickets/{id}:
 *   get:
 *     tags:
 *       - Tickets
 *     summary: Consultar ticket por ID
 *     description: Retorna um ticket não excluído, incluindo o administrador responsável pela última atualização e sua observação mais recente.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: UUID do ticket.
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Ticket recuperado com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ticket:
 *                   type: object
 *                   description: Ticket completo com os relacionamentos updatedBy e ticketNote.
 *       401:
 *         description: Sessão ausente ou inválida.
 *       404:
 *         description: Ticket não encontrado.
 *       500:
 *         description: Erro interno ao consultar ticket.
 *
 *   patch:
 *     tags:
 *       - Tickets
 *     summary: Atualizar dados de um ticket
 *     description: Atualiza os campos informados e registra o administrador responsável. O campo comment cria ou substitui a observação mais recente.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             minProperties: 1
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 120
 *               email:
 *                 type: string
 *                 format: email
 *                 maxLength: 254
 *               phone:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 30
 *               city:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 120
 *               address:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 300
 *               degree:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 120
 *               motive:
 *                 type: string
 *                 nullable: true
 *                 maxLength: 2000
 *               indication:
 *                 type: string
 *                 nullable: true
 *                 maxLength: 2000
 *               comment:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 5000
 *                 description: Substitui a observação anterior.
 *           example:
 *             name: "Aluno Exemplo"
 *             phone: "92999999999"
 *             comment: "Cadastro atualizado pelo administrador."
 *     responses:
 *       200:
 *         description: Ticket atualizado com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 ticket:
 *                   type: object
 *       400:
 *         description: Dados inválidos ou nenhum campo editável informado.
 *       401:
 *         description: Sessão ausente ou inválida.
 *       404:
 *         description: Ticket não encontrado.
 *       500:
 *         description: Erro interno ao atualizar ticket.
 *
 *   delete:
 *     tags:
 *       - Tickets
 *     summary: Excluir logicamente um ticket
 *     description: Define deleted como true, registra o administrador responsável e reorganiza as posições dos tickets restantes na mesma coluna do Kanban.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Ticket excluído com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Ticket excluído com sucesso."
 *       401:
 *         description: Sessão ausente ou inválida.
 *       404:
 *         description: Ticket não encontrado ou já excluído.
 *       409:
 *         description: Conflito de atualização. Tente novamente.
 *       500:
 *         description: Erro interno ao excluir ticket.
 */
export async function GET(
  request: Request,
  { params }: RouteContext
) {
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

    const { id } = await params;

    const ticket = await prisma.ticket.findFirst({
      where: {
        id,
        deleted: false,
      },
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

      console.log("Ticket recuperado do banco:");
      console.log(JSON.stringify(ticket, null, 2));

    if (!ticket) {
      return NextResponse.json(
        { error: "Ticket não encontrado." },
        { status: 404 }
      );
    }

    


    return NextResponse.json(
      { ticket },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error("Erro ao consultar ticket:", error);

    return NextResponse.json(
      { error: "Erro interno ao consultar ticket." },
      { status: 500 }
    );
  }
}


export async function PATCH(
  request: Request,
  { params }: RouteContext
) {
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

    const { id } = await params;
    const body = await request.json().catch(() => null);

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json(
        { error: "Dados inválidos." },
        { status: 400 }
      );
    }

    const data: Prisma.TicketUpdateInput = {
      updatedBy: {
        connect: { id: session.user.id },
      },
    };

    const requiredFields = {
      name: 120,
      email: 254,
      phone: 30,
      city: 120,
      address: 300,
      degree: 120,
    } as const;

    let changed = false;

    for (const field of Object.keys(requiredFields) as Array<
      keyof typeof requiredFields
    >) {
      if (!(field in body)) continue;

      const value = body[field];

      if (
        typeof value !== "string" ||
        !value.trim() ||
        value.trim().length > requiredFields[field]
      ) {
        return NextResponse.json(
          { error: `Campo inválido: ${field}.` },
          { status: 400 }
        );
      }

      data[field] = value.trim();
      changed = true;
    }

    if (
      "email" in body &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email.trim())
    ) {
      return NextResponse.json(
        { error: "E-mail inválido." },
        { status: 400 }
      );
    }

    for (const field of ["motive", "indication"] as const) {
      if (!(field in body)) continue;

      const value = body[field];

      if (
        value !== null &&
        (typeof value !== "string" || value.length > 2000)
      ) {
        return NextResponse.json(
          { error: `Campo inválido: ${field}.` },
          { status: 400 }
        );
      }

      data[field] = value?.trim() || null;
      changed = true;
    }

    if ("comment" in body) {
      const comment = body.comment;

      if (
        typeof comment !== "string" ||
        !comment.trim() ||
        comment.trim().length > 5000
      ) {
        return NextResponse.json(
          { error: "Observação inválida." },
          { status: 400 }
        );
      }

      data.ticketNote = {
        upsert: {
          create: {
            comment: comment.trim(),
            updatedBy: {
              connect: { id: session.user.id },
            },
          },
          update: {
            comment: comment.trim(),
            updatedBy: {
              connect: { id: session.user.id },
            },
          },
        },
      };

      changed = true;
    }

    if (!changed) {
      return NextResponse.json(
        { error: "Nenhum campo editável informado." },
        { status: 400 }
      );
    }

    const ticket = await prisma.ticket.update({
      where: {
        id,
        deleted: false,
      },
      data,
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
      {
        message: "Ticket atualizado com sucesso.",
        ticket,
      },
      { status: 200 }
    );
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return NextResponse.json(
        { error: "Ticket não encontrado." },
        { status: 404 }
      );
    }

    console.error("Erro ao atualizar ticket:", error);

    return NextResponse.json(
      { error: "Erro interno ao atualizar ticket." },
      { status: 500 }
    );
  }
}


export async function DELETE(
  request: Request,
  { params }: RouteContext
) {
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

    const { id } = await params;

    const deleted = await prisma.$transaction(
      async (tx) => {
        const current = await tx.ticket.findFirst({
          where: {
            id,
            deleted: false,
          },
          select: {
            status: true,
          },
        });

        if (!current) return false;

        const result = await tx.ticket.updateMany({
          where: {
            id,
            deleted: false,
          },
          data: {
            deleted: true,
            updatedById: session.user.id,
          },
        });

        if (result.count === 0) return false;

        const tickets = await tx.ticket.findMany({
          where: {
            status: current.status,
            deleted: false,
          },
          orderBy: [
            { position: "asc" },
            { createdAt: "asc" },
            { id: "asc" },
          ],
          select: {
            id: true,
            position: true,
          },
        });

        for (let position = 0; position < tickets.length; position++) {
          const ticket = tickets[position];

          if (ticket.position === position) continue;

          await tx.ticket.update({
            where: {
              id: ticket.id,
            },
            data: {
              position,
            },
          });
        }

        return true;
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      }
    );

    if (!deleted) {
      return NextResponse.json(
        { error: "Ticket não encontrado ou já excluído." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Ticket excluído com sucesso." },
      { status: 200 }
    );
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2034"
    ) {
      return NextResponse.json(
        { error: "Conflito de atualização. Tente novamente." },
        { status: 409 }
      );
    }

    console.error("Erro ao excluir ticket:", error);

    return NextResponse.json(
      { error: "Erro interno ao excluir ticket." },
      { status: 500 }
    );
  }
}