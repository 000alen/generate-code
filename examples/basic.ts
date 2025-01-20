import "dotenv/config";

import { openai } from "@ai-sdk/openai";
import { generateCode } from "../src";

async function main() {
  const model = openai("gpt-4o");
  const result = await generateCode({
    model,
    declarations: {
      "types.ts": "export interface User { name: string; }",
    },
    exports: {
      user: "User",
    },
    prompt: "Generate a user for Felipe",
  });

  console.log(result);
}

main().catch(console.error);
