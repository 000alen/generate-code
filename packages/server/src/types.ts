import { LanguageModel } from "ai";

export type Code = Record<string, string>;

export type Declarations = Record<
  string,
  {
    content: string;
    context: boolean;
  }
>;

export interface GenerateCodeOptions {
  model: LanguageModel;
  declarations: Declarations;
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
