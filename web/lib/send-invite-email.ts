import { getResendClient, FROM_ADDRESS } from "@/lib/resend";

function loginUrl(): string {
  const base = process.env.APP_BASE_URL ?? "http://localhost:3000";
  return `${base.replace(/\/$/, "")}/auth/login`;
}

const ROLE_LABEL: Record<"owner" | "member", string> = {
  owner: "administrador(a)",
  member: "membro",
};

/**
 * Envia o e-mail de convite via Resend (remetente noreply@ai2.com.br).
 * Não lança em caso de falha no envio — quem chama decide o que fazer (ex.:
 * manter o convite pendente no banco de qualquer forma e avisar a UI que o
 * e-mail pode não ter saído, sem desfazer o convite já criado).
 */
export async function sendInviteEmail({
  email,
  organizationName,
  role,
}: {
  email: string;
  organizationName: string;
  role: "owner" | "member";
}): Promise<{ sent: boolean; error?: string }> {
  try {
    const resend = getResendClient();
    const url = loginUrl();

    const { error } = await resend.emails.send({
      from: FROM_ADDRESS,
      to: email,
      subject: `Você foi convidado para "${organizationName}" no AI2 - Business OS`,
      html: `
        <div style="font-family: -apple-system, sans-serif; max-width: 480px; margin: 0 auto; color: #111;">
          <h2 style="font-weight: 600;">Você foi convidado para o AI2 - Business OS</h2>
          <p>
            Você foi convidado como <strong>${ROLE_LABEL[role]}</strong> da organização
            <strong>${organizationName}</strong> no AI2 - Business OS.
          </p>
          <p>
            Para entrar, faça login com este mesmo endereço de e-mail
            (<strong>${email}</strong>):
          </p>
          <p style="margin: 24px 0;">
            <a
              href="${url}"
              style="background: #111; color: #fff; padding: 12px 20px; border-radius: 999px; text-decoration: none; font-weight: 500;"
            >
              Entrar no AI2 - Business OS
            </a>
          </p>
          <p style="color: #666; font-size: 13px;">
            Se você não esperava este convite, pode ignorar este e-mail.
          </p>
        </div>
      `,
      text:
        `Você foi convidado como ${ROLE_LABEL[role]} da organização "${organizationName}" no AI2 - Business OS.\n\n` +
        `Faça login com o e-mail ${email} em: ${url}\n\n` +
        `Se você não esperava este convite, pode ignorar esta mensagem.`,
    });

    if (error) return { sent: false, error: error.message };
    return { sent: true };
  } catch (err) {
    return { sent: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}
