import "dotenv/config";

import { openai } from "@ai-sdk/openai";
import { generateCode } from "@000alen/generate-code-server";

async function main() {
  const model = openai("gpt-4o");
  const result = await generateCode({
    model,
    declarations: {
      "types.ts": {
        content: "export interface User { name: string; }",
        context: true,
      },
    },
    exports: {
      user: "User",
    },
    prompt: "Generate a user for Felipe",
  });

  console.log(result);
}

main().catch(console.error);
