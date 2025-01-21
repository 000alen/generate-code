import { generateText, CoreMessage } from "ai";
import { join } from "path";
import { createCompiler, createCompilerOptions } from "./compiler";
import { getCompilerMessage, getSystemMessage } from "./prompt";
import { Code } from "./types";
import { GenerateCodeOptions, GenerateCodeResult } from "./types";
import { createReadTool, createWriteTool } from "./tools";
import { IFs, memfs } from "memfs";

export async function writeCode(fs: IFs, code: Code, basePath: string) {
  fs.mkdirSync(basePath, { recursive: true });
  Object.entries(code).forEach(([path, content]) =>
    fs.writeFileSync(join(basePath, path), content)
  );
}

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

  const { fs } = memfs();
  const compilerOptions = createCompilerOptions();
  const compiler = createCompiler(fs, compilerOptions);

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

    await writeCode(fs, code, basePath);

    compilerErrors = compiler(
      Object.keys(code).map((path) => join(basePath, path))
    );

    if (compilerErrors.length === 0) break;

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
