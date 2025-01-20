import { generateText, CoreMessage } from "ai";
import { join } from "path";
import { createCompiler, createCompilerOptions } from "./compiler";
import { getSystemPrompt } from "./prompt";
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
  const write = createWriteTool(code);
  const read = createReadTool(code);

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
    async onStepFinish(event) {
      // console.log(event);
    },
  });

  const { fs } = memfs();
  await writeCode(fs, code, basePath);
  const compilerOptions = createCompilerOptions();
  const compiler = createCompiler(fs, compilerOptions);
  const compilerErrors = compiler(
    Object.keys(code).map((path) => join(basePath, path))
  );

  return {
    code,
    compilerErrors,
  };
}
