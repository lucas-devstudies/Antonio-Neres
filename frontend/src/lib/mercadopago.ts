
import { MercadoPagoConfig } from "mercadopago";

const accessToken = process.env.MP_ACCESS_TOKEN;

if (!accessToken) {
  throw new Error("MP_ACCESS_TOKEN não está definido no ambiente.");
}

export const mercadoPago = new MercadoPagoConfig({
  accessToken,
});



