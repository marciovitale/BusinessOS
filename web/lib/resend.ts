import { Resend } from "resend";

const FROM_ADDRESS = "AI2 - Business OS <noreply@ai2.com.br>";

export function getResendClient(): Resend {
  if (!process.env.RESEND_API_KEY) {
    throw new Error(
      "RESEND_API_KEY não configurada. Adicione sua chave em .env.local e reinicie o servidor.",
    );
  }
  return new Resend(process.env.RESEND_API_KEY);
}

export { FROM_ADDRESS };
