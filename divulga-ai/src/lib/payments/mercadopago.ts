import "server-only";
import { MercadoPagoConfig, Payment, PreApproval } from "mercadopago";

let config: MercadoPagoConfig | null = null;

function getConfig() {
  if (!process.env.MERCADOPAGO_ACCESS_TOKEN) throw new Error("MERCADOPAGO_ACCESS_TOKEN não configurado");
  config ??= new MercadoPagoConfig({ accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN });
  return config;
}

export const mpPreApproval = () => new PreApproval(getConfig());
export const mpPayment = () => new Payment(getConfig());
