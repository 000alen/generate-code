import { LanguageModel, generateText, CoreMessage } from "ai";
import { z } from "zod";
import { memory_fs } from "./fs";
import { join } from "path";
import { compile, createCompilerOptions } from "./compiler";

export type Code = Record<string, string>;

export interface GenerateCodeOptions {
  model: LanguageModel;
  declarations: Code;
  exports: Record<string, string>;
  tsconfig?: string;

  maxSteps?: number;
  prompt?: string;

  basePath?: string;
}

export interface GenerateCodeResult {
  readonly code: Code;
  readonly compilerErrors: string[];
}

function getSystemPrompt(
  code: Code,
  declarations: Code,
  exports: Record<string, string>
) {
  const _code = Object.entries(code)
    .map(([path, content]) => `<file path="${path}">${content}</file>`)
    .join("\n");

  const _declarations = Object.entries(declarations)
    .map(
      ([path, content]) =>
        `<declaration path="${path}">${content}</declaration>`
    )
    .join("\n");

  const _exports = Object.entries(exports)
    .map(([name, type]) => `${name}: ${type}`)
    .join("\n");

  return `
You are an expert TypeScript developer. You are given a codebase and a set of type declarations, and you need to generate code that exports the required values (or types). You must generate code that conforms to the type declarations and exports the required values (or types). You follow the TypeScript language rules and best practices.

Here are the current files in the codebase:
${_code}

Here are the type declarations:
${_declarations}

Generate code that exports:
${_exports}
`.trim();
}

export async function generateCode(
  options: GenerateCodeOptions
): Promise<GenerateCodeResult> {
  const {
    model,
    declarations,
    exports,
    prompt,
    maxSteps = 10,
    basePath = "/src",
  } = options;

  const code: Code = Object.fromEntries(
    Object.entries(declarations).map(([path, content]) => [path, content])
  );

  const instructions = getSystemPrompt(code, declarations, exports);

  const messages: CoreMessage[] = [
    {
      role: "system",
      content: instructions,
    },
    {
      role: "user",
      content: prompt ?? "Generate the code",
    },
  ];

  await generateText({
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
          // console.log(args, options);
          code[args.path] = args.content;
        },
      },
      read: {
        description: "Read a file from the codebase",
        parameters: z.object({
          path: z.string(),
        }),
        execute: async (args, options) => {
          if (code[args.path]) {
            return {
              path: args.path,
              content: code[args.path],
            };
          }

          return {
            path: args.path,
            content: null,
          };
        },
      },
    },
    async onStepFinish(event) {
      // console.log(event);
    },
  });

  memory_fs.mkdirSync(basePath, { recursive: true });
  Object.entries(code).forEach(([path, content]) =>
    memory_fs.writeFileSync(join(basePath, path), content)
  );
  const compilerOptions = createCompilerOptions();
  const compilerErrors = compile(
    Object.keys(code).map((path) => join(basePath, path)),
    compilerOptions
  );

  return {
    code,
    compilerErrors,
  };
}
