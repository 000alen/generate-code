import "dotenv/config";

import fs from "fs";
import { createAzure } from "@ai-sdk/azure";
import { generateCode } from "../src";

const azure = createAzure({
  resourceName: process.env.AZURE_RESOURCE_NAME!,
  apiKey: process.env.AZURE_API_KEY!,
});

async function main() {
  const model = azure("gpt-4o");

  const tableDeclaration = fs.readFileSync(
    "./examples/declarations/table.ts",
    "utf-8"
  );

  const result = await generateCode({
    model,
    declarations: {
      "table.ts": tableDeclaration,
    },
    exports: {
      table: "Table",
    },
    prompt: "Generate a table for users",
  });

  console.log(result);
}

main().catch(console.error);
