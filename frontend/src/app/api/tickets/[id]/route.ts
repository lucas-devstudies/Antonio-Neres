import { Prisma } from "@/generated/prisma/client";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{ id: string }>;
};

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