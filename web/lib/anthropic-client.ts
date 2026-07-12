import Anthropic from "@anthropic-ai/sdk";

// Falha cedo e com mensagem clara quando a chave não está configurada,
// em vez de deixar o erro genérico do SDK subir para a UI.
export function getAnthropicClient(): Anthropic {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error(
      "ANTHROPIC_API_KEY não configurada. Adicione sua chave em .env.local e reinicie o servidor.",
    );
  }
  return new Anthropic();
}
