import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
  // Ignora build output e arquivos auto-gerados.
  // database.types.ts é gerado pelo `supabase gen types` — não faz sentido
  // lintar, e o tamanho massivo confunde o parser do ESLint.
  globalIgnores(["dist", "src/lib/database.types.ts"]),

  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
    },
    rules: {
      // `catch (err: any)` é usado em todos os handlers de Supabase.
      // A forma exata dos erros do client é difícil de tipar sem
      // inferência condicional excessiva. A troca para `unknown` seria
      // trabalho massivo sem ganho real neste contexto.
      "@typescript-eslint/no-explicit-any": "off",

      // Fetch inicial dentro de useEffect é o padrão do projeto em ~10
      // hooks. A regra `set-state-in-effect` do React 19 recomenda
      // alternativas (Suspense, use(), etc) mas migrar seria uma
      // refatoração grande. Mantemos a abordagem atual.
      "react-hooks/set-state-in-effect": "off",
    },
  },
]);
