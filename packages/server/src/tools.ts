import { CoreTool, tool } from "ai";
import { z } from "zod";
import { Code } from "./types";
import { IFs } from "memfs";
import { createCompiler } from "./compiler";
import { join } from "path";
import { writeCode } from "./fs";

export function createWriteTool(code: Code): CoreTool {
  return tool({
    description: "Write a file to the codebase",
    parameters: z.object({
      path: z.string(),
      content: z.string(),
    }),
    execute: async (args, options) => {
      code[args.path] = args.content;

      return {
        path: args.path,
        status: "success",
      };
    },
  });
}

export function createReadTool(code: Code): CoreTool {
  return tool({
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
        content: "",
      };
    },
  });
}

export function createCheckTool(
  code: Code,
  fs: IFs,
  compiler: ReturnType<typeof createCompiler>,
  basePath: string
): CoreTool {
  return tool({
    description: "Check if the codebase is correct",
    parameters: z.object({}),
    execute: async () => {
      await writeCode(fs, code, basePath);

      const compilerErrors = compiler(
        Object.keys(code).map((path) => join(basePath, path))
      );

      if (compilerErrors.length > 0) {
        return {
          status: "error",
          errors: compilerErrors,
        };
      }

      return {
        status: "success",
      };
    },
  });
}
