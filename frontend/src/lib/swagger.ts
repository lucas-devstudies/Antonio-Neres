
import { createSwaggerSpec } from "next-swagger-doc";

export const getApiDocs = async () => {
  return createSwaggerSpec({
    apiFolder: "src/app/api",
    autoDoc: true,
    definition: {

        components: {
  securitySchemes: {
    cookieAuth: {
      type: "apiKey",
      in: "cookie",
      name: "better-auth.session_token",
      description:
        "Sessão de autenticação gerenciada pelo Better Auth.",
    },
  },
},

      openapi: "3.0.0",
      info: {
        title: "Antonio-Neres API",
        version: "1.0.0",
        description: "Documentação da API do sistema Antonio-Neres.",
      },
      servers: [
        {
          url: "/",
        },
      ],
    },
  });
};
