import * as real_fs from "fs";
import * as ts from "typescript";
import { IFs } from "memfs";
import { memory_fs } from "@/fs";

export function createCompilerOptions(): ts.CompilerOptions {
  return {
    noEmitOnError: true,
    noImplicitAny: true,
    module: ts.ModuleKind.ESNext,
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

export function createCompilerHost(fs: IFs, options: ts.CompilerOptions) {
  const host = ts.createCompilerHost(options);

  // Override methods to use memfs and fallback to real fs
  host.readFile = (fileName: string): string | undefined => {
    try {
      // Try reading from memfs
      // return memory_fs.readFileSync(fileName, "utf8") as string;
      if (fs.existsSync(fileName)) {
        return fs.readFileSync(fileName, "utf8") as string;
      } else if (fs.existsSync(`${fileName}.ts`)) {
        return fs.readFileSync(`${fileName}.ts`, "utf8") as string;
      }

      throw new Error("File not found");
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
    if (fs.existsSync(fileName) || fs.existsSync(`${fileName}.ts`)) {
      return true;
    } else {
      return real_fs.existsSync(fileName);
    }
  };

  host.directoryExists = (dirName: string): boolean => {
    try {
      return fs.statSync(dirName).isDirectory();
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
      fs.writeFileSync(fileName, data, { encoding: "utf8" });
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
): string[] {
  let host = createCompilerHost(memory_fs, options);
  let program = ts.createProgram(fileNames, options, host);
  let emitResult = program.emit();

  let allDiagnostics = ts
    .getPreEmitDiagnostics(program)
    .concat(emitResult.diagnostics);

  // let exitCode = emitResult.emitSkipped ? 1 : 0;
  // if (exitCode !== 0) {
  //   console.log("Process exiting with code '1'.");
  //   throw new Error("Compilation failed");
  // }

  return allDiagnostics.map((diagnostic) => {
    if (diagnostic.file) {
      let message = ts.flattenDiagnosticMessageText(
        diagnostic.messageText,
        "\n"
      );

      // let { line, character } = ts.getLineAndCharacterOfPosition(
      //   diagnostic.file,
      //   diagnostic.start!
      // );
      // console.log(
      //   `${diagnostic.file.fileName} (${line + 1},${character + 1}): ${message}`
      // );
      return message;
    } else {
      // console.log(
      //   ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n")
      // );
      let message = ts.flattenDiagnosticMessageText(
        diagnostic.messageText,
        "\n"
      );

      return message;
    }
  });
}

export function createCompiler(fs: IFs, options: ts.CompilerOptions) {
  return (fileNames: string[]) => {
    const host = createCompilerHost(fs, options);
    const program = ts.createProgram(fileNames, options, host);
    const emitResult = program.emit();

    const diagnostics = ts
      .getPreEmitDiagnostics(program)
      .concat(emitResult.diagnostics);

    return diagnostics.map((diagnostic) =>
      ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n")
    );
  };
}
