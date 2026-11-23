import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";



/**
 * @swagger
 * /api/users/me:
 *   get:
 *     tags:
 *       - Usuários
 *     summary: Consultar usuário autenticado
 *     description: >
 *       Retorna o nome e o e-mail do usuário associado
 *       à sessão atual do Better Auth.
 *       Requer autenticação.
 *     responses:
 *       200:
 *         description: Usuário recuperado com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       example: "Administrador"
 *                     email:
 *                       type: string
 *                       format: email
 *                       example: "admin@example.com"
 *       401:
 *         description: Sessão ausente ou inválida.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Acesso não autorizado."
 *       500:
 *         description: Erro interno ao consultar usuário.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Erro interno ao consultar usuário."
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

    const {name, email} = session.user;

    return NextResponse.json(
      {
        user: {
          name,
          email,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erro ao consultar usuário:", error);

    return NextResponse.json(
      { error: "Erro interno ao consultar usuário." },
      { status: 500 }
    );
  }
}