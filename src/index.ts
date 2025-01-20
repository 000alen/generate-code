import { LanguageModel, generateText, CoreMessage } from "ai";
import { z } from "zod";

export type Code = Record<string, string>;

export interface GenerateCodeOptions {
  model: LanguageModel;
  definitions: Record<string, string>;
  exports: Record<string, string>;
  tsconfig?: string;

  maxSteps?: number;
  prompt?: string;
}

export interface GenerateCodeResult {
  readonly code: Code;
}

export async function generateCode(
  options: GenerateCodeOptions
): Promise<GenerateCodeResult> {
  const { model, prompt, maxSteps = 10 } = options;

  const code: Code = {};

  const messages: CoreMessage[] = [];
  if (prompt) {
    messages.push({
      role: "user",
      content: prompt,
    });
  }

  const result = await generateText({
    model,
    messages,
    tools: {
      write: {
        description: "Write a file to the codebase",
        parameters: z.object({
          path: z.string(),
          content: z.string(),
        }),
        execute: async (args, options) => {
          console.log(args, options);
        },
      },
      read: {
        description: "Read a file from the codebase",
        parameters: z.object({
          path: z.string(),
        }),
        execute: async (args, options) => {
          console.log(args, options);
        },
      },
    },
    async onStepFinish(event) {
      console.log(event);
    },
  });

  return {
    code,
  };
}
