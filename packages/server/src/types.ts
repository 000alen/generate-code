import { LanguageModel } from "ai";

export type Code = Record<string, string>;

export type Declarations = Record<
  string,
  {
    content: string;
    context: boolean;
  }
>;

export type CompilerError = string;

export interface GenerateCodeOptions {
  model: LanguageModel;
  declarations: Declarations;
  exports: Record<string, string>;
  tsconfig?: string;

  maxSteps?: number;
  maxIterations?: number;
  prompt?: string;

  basePath?: string;

  code?: Code;
  compilerErrors?: CompilerError[];
}

export interface GenerateCodeResult {
  readonly code: Code;
  readonly compilerErrors: CompilerError[];
}
