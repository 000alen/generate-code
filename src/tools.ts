import { CoreTool } from "ai";
import { z } from "zod";
import { Code } from "./types";

export function createWriteTool(code: Code): CoreTool {
  return {
    description: "Write a file to the codebase",
    parameters: z.object({
      path: z.string(),
      content: z.string(),
    }),
    execute: async (args, options) => {
      // console.log(args, options);
      code[args.path] = args.content;
    },
  };
}

export function createReadTool(code: Code): CoreTool {
  return {
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
  };
}
