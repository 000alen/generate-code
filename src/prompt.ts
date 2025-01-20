import { Code } from "./types";

export function getSystemPrompt(
  code: Code,
  declarations: Code,
  exports: Record<string, string>
): string {
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
