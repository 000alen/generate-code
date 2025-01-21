import { generateText, CoreMessage } from "ai";
import { createCompiler, createCompilerOptions } from "./compiler";
import { getCompilerMessage, getSystemMessage } from "./prompt";
import { GenerateCodeOptions, GenerateCodeResult } from "./types";
import { createCheckTool, createReadTool, createWriteTool } from "./tools";
import { memfs } from "memfs";

export async function generateCode(
  options: GenerateCodeOptions
): Promise<GenerateCodeResult> {
  let {
    model,
    declarations,
    exports,
    prompt,
    maxSteps = 10,
    maxIterations = 10,
    basePath = "/src",

    code = {},
    compilerErrors = [],
  } = options;

  const codeWithNoDeclarations = Object.fromEntries(
    Object.entries(code).filter(([path]) => !declarations[path])
  );
  const instructions = getSystemMessage(
    codeWithNoDeclarations,
    compilerErrors,
    declarations,
    exports
  );

  Object.entries(declarations).forEach(([path, { content }]) => {
    code[path] = content;
  });

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

  const { fs } = memfs();
  const compilerOptions = createCompilerOptions();
  const compiler = createCompiler(fs, compilerOptions);

  const write = createWriteTool(code);
  const read = createReadTool(code);
  const check = createCheckTool(code, fs, compiler, basePath);

  for (let i = 0; i < maxIterations; i++) {
    const result = await generateText({
      model,
      messages,
      tools: {
        write,
        read,
      },
      maxSteps,
    });

    const checkResult = await check.execute!(
      {},
      {
        toolCallId: "check",
        messages,
      }
    );

    if (checkResult.status === "success") break;

    compilerErrors = checkResult.errors;

    result.toolCalls.forEach((call, i) => {
      messages.push({
        role: "tool",
        content: [
          {
            type: "tool-result",
            toolCallId: call.toolCallId,
            toolName: call.toolName,
            result: result.toolResults[i],
          },
        ],
      });
    });
    messages.push({
      role: "assistant",
      content: result.text,
    });
    messages.push({
      role: "user",
      content: getCompilerMessage(compilerErrors),
    });
  }

  return {
    code,
    compilerErrors,
  };
}

export async function generateCodeWithClient(
  options: Exclude<GenerateCodeOptions, "maxIterations" | "basePath">
): Promise<GenerateCodeResult> {
  let {
    model,
    declarations,
    exports,
    prompt,
    maxSteps = 10,

    code = {},
    compilerErrors = [],
  } = options;

  const codeWithNoDeclarations = Object.fromEntries(
    Object.entries(code).filter(([path]) => !declarations[path])
  );
  const instructions = getSystemMessage(
    codeWithNoDeclarations,
    compilerErrors,
    declarations,
    exports
  );
  const write = createWriteTool(code);
  const read = createReadTool(code);

  Object.entries(declarations).forEach(([path, { content }]) => {
    code[path] = content;
  });

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
      write,
      read,
    },
    maxSteps,
  });

  return {
    code,
    compilerErrors,
  };
}
