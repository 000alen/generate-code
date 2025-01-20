import { openai } from "@ai-sdk/openai";
import { generateCode } from "../src";

async function main() {
  const model = openai("gpt-4o");

  const result = await generateCode({
    model,
    definitions: {
      "@/types": "export interface MyInterface { name: string; }",
    },
    exports: {
      MyInterface: "MyInterface",
    },

    prompt: "Generate an interface for Felipe",
  });

  console.log(result.code);
}

main().catch(console.error);
