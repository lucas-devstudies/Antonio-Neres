
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  Prisma,
  TicketStatus,
} from "@/generated/prisma/client";

type RouteContext = {
  params: Promise<{ id: string }>;
};

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

    if (
      !body ||
      typeof body !== "object" ||
      Array.isArray(body) ||
      !Object.values(TicketStatus).includes(body.status) ||
      !Number.isSafeInteger(body.position) ||
      body.position < 0
    ) {
      return NextResponse.json(
        { error: "Status ou posição inválidos." },
        { status: 400 }
      );
    }

    const newStatus: TicketStatus = body.status;
    const newPosition: number = body.position;

    const result = await prisma.$transaction(
      async (tx) => {
        const current = await tx.ticket.findFirst({
          where: {
            id,
            deleted: false,
          },
          select: {
            id: true,
            status: true,
          },
        });

        if (!current) {
          return { error: "Ticket não encontrado.", status: 404 };
        }

        const tickets = await tx.ticket.findMany({
          where: {
            deleted: false,
            status: {
              in: [current.status, newStatus],
            },
          },
          orderBy: [
            { position: "asc" },
            { createdAt: "asc" },
            { id: "asc" },
          ],
          select: {
            id: true,
            status: true,
            position: true,
          },
        });

        const source = tickets.filter(
          (ticket) => ticket.status === current.status
        );

        const destination =
          current.status === newStatus
            ? source
            : tickets.filter(
                (ticket) => ticket.status === newStatus
              );

        const movingIndex = source.findIndex(
          (ticket) => ticket.id === id
        );

        const [moving] = source.splice(movingIndex, 1);

        if (newPosition > destination.length) {
          return { error: "Posição fora da coluna.", status: 400 };
        }

        destination.splice(newPosition, 0, moving);

        const updates =
          current.status === newStatus
            ? [{ status: newStatus, items: destination }]
            : [
                { status: current.status, items: source },
                { status: newStatus, items: destination },
              ];

        for (const column of updates) {
          for (let position = 0; position < column.items.length; position++) {
            const ticket = column.items[position];

            if (
              ticket.id !== id &&
              ticket.status === column.status &&
              ticket.position === position
            ) {
              continue;
            }

            await tx.ticket.update({
              where: { id: ticket.id },
              data: {
                status: column.status,
                position,
                ...(ticket.id === id
                  ? { updatedById: session.user.id }
                  : {}),
              },
            });
          }
        }

        return {
          ticket: await tx.ticket.findUnique({
            where: { id },
            select: {
              id: true,
              status: true,
              position: true,
              updatedById: true,
              updatedAt: true,
            },
          }),
        };
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      }
    );

    if ("error" in result) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status }
      );
    }

    return NextResponse.json({
      message: "Ticket movimentado com sucesso.",
      ticket: result.ticket,
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2034"
    ) {
      return NextResponse.json(
        { error: "Movimentação concorrente. Tente novamente." },
        { status: 409 }
      );
    }

    console.error("Erro ao movimentar ticket:", error);

    return NextResponse.json(
      { error: "Erro interno ao movimentar ticket." },
      { status: 500 }
    );
  }
}
