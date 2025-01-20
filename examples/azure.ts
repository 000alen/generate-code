import "dotenv/config";

import { createAzure } from "@ai-sdk/azure";
import { generateCode } from "../src";

const azure = createAzure({
  resourceName: process.env.AZURE_RESOURCE_NAME!,
  apiKey: process.env.AZURE_API_KEY!,
});

async function main() {
  const model = azure("gpt-4o");

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
