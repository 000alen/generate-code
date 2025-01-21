import "dotenv/config";
import { createAzure } from "@ai-sdk/azure";
import { generateCode } from "@000alen/generate-code-server";
import fs from "fs";

const azure = createAzure({
  resourceName: process.env.AZURE_RESOURCE_NAME!,
  apiKey: process.env.AZURE_API_KEY!,
});

async function getDeclaration() {
  const response = await fetch("https://esm.sh/@types/react@18.3.1/index.d.ts");
  const text = await response.text();
  return text;
}

async function main() {
  const model = azure("gpt-4o");

  const reactDeclaration = await getDeclaration();

  const buttonDeclaration = fs.readFileSync(
    "./examples/declarations/button.ts",
    "utf-8"
  );

  const result = await generateCode({
    model,
    declarations: {
      "react.ts": { content: reactDeclaration, context: false },
      "button.ts": { content: buttonDeclaration, context: true },
    },
    exports: {
      Button: "React.FC<ButtonProps>",
    },
    prompt: "Generate a styled React button component with TypeScript props",
  });

  console.log(result);
}

main().catch(console.error);
