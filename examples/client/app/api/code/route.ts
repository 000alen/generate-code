import type {
  Code,
  CompilerError,
} from "@000alen/generate-code-server/dist/types";
import { generateCodeWithClient } from "@000alen/generate-code-server";
import { createAzure } from "@ai-sdk/azure";

const azure = createAzure({
  resourceName: process.env.AZURE_RESOURCE_NAME!,
  apiKey: process.env.AZURE_API_KEY!,
});

export const POST = async (request: Request) => {
  const { code, compilerErrors } = (await request.json()) as {
    code: Code;
    compilerErrors: CompilerError[];
  };

  const result = await generateCodeWithClient({
    model: azure("gpt-4o"),

    code,
    compilerErrors,

    declarations: {},
    exports: {},

    prompt: "Generate a user for Felipe",
  });

  return new Response(JSON.stringify(result), {
    headers: {
      "Content-Type": "application/json",
    },
  });
};
