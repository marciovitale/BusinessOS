import type { Preview } from "@storybook/nextjs-vite";
import "../app/globals.css";

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    // Backgrounds branco/preto para validar contraste no tema P&B (spec seção 10).
    backgrounds: {
      default: "light",
      values: [
        { name: "light", value: "#ffffff" },
        { name: "dark", value: "#0a0a0a" },
      ],
    },
    layout: "centered",
    a11y: {
      // 'todo' - mostra violações de a11y só na UI de teste
      // 'error' - falha o CI em violações de a11y
      // 'off' - pula as checagens
      test: "todo",
    },
  },
};

export default preview;
