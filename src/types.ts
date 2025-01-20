import { LanguageModel } from "ai";

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
