import * as real_fs from "fs";
import * as ts from "typescript";
import { memory_fs } from "@/fs";

export function createCompilerOptions(outFile: string): ts.CompilerOptions {
  return {
    noEmitOnError: true,
    noImplicitAny: true,
    outFile,
    module: ts.ModuleKind.AMD,
    jsx: ts.JsxEmit.ReactJSX,
    declaration: true,
    target: ts.ScriptTarget.ESNext,
    moduleResolution: ts.ModuleResolutionKind.Node10,
    strict: true,
    skipLibCheck: true,
    esModuleInterop: true,
    resolveJsonModule: true,
    noEmitHelpers: false,
  };
}

export function createCompilerHost(options: ts.CompilerOptions) {
  const host = ts.createCompilerHost(options);

  // Override methods to use memfs and fallback to real fs
  host.readFile = (fileName: string): string | undefined => {
    try {
      // Try reading from memfs
      return memory_fs.readFileSync(fileName, "utf8") as string;
    } catch {
      try {
        // Fallback to real file system
        return real_fs.readFileSync(fileName, "utf8");
      } catch {
        return undefined;
      }
    }
  };

  host.fileExists = (fileName: string): boolean => {
    if (memory_fs.existsSync(fileName)) {
      return true;
    } else {
      return real_fs.existsSync(fileName);
    }
  };

  host.directoryExists = (dirName: string): boolean => {
    try {
      return memory_fs.statSync(dirName).isDirectory();
    } catch {
      try {
        return real_fs.statSync(dirName).isDirectory();
      } catch {
        return false;
      }
    }
  };

  host.writeFile = (
    fileName: string,
    data: string,
    writeByteOrderMark: boolean,
    onError?: (message: string) => void
  ): void => {
    try {
      memory_fs.writeFileSync(fileName, data, { encoding: "utf8" });
    } catch (e: unknown) {
      if (onError) onError((e as Error).message);
    }
  };

  host.getCurrentDirectory = (): string => "/";

  return host;
}

export function compile(
  fileNames: string[],
  options: ts.CompilerOptions
): void {
  let host = createCompilerHost(options);

  let program = ts.createProgram(fileNames, options, host);
  let emitResult = program.emit();

  let allDiagnostics = ts
    .getPreEmitDiagnostics(program)
    .concat(emitResult.diagnostics);

  allDiagnostics.forEach((diagnostic) => {
    if (diagnostic.file) {
      let { line, character } = ts.getLineAndCharacterOfPosition(
        diagnostic.file,
        diagnostic.start!
      );
      let message = ts.flattenDiagnosticMessageText(
        diagnostic.messageText,
        "\n"
      );
      console.log(
        `${diagnostic.file.fileName} (${line + 1},${character + 1}): ${message}`
      );
    } else {
      console.log(
        ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n")
      );
    }
  });

  let exitCode = emitResult.emitSkipped ? 1 : 0;

  if (exitCode !== 0) {
    console.log("Process exiting with code '1'.");
    throw new Error("Compilation failed");
  }
}
