export interface GenerateCodeOptions {
  definitions: Record<string, string>;
  tsconfig: string;
}

export interface GenerateCodeResult {
  readonly code: Record<string, string>;
}

export async function generateCode(
  options: GenerateCodeOptions
): Promise<GenerateCodeResult> {
  throw new Error("Not implemented");
}
