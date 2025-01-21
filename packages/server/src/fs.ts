import { IFs, memfs } from "memfs";
import { Code } from "./types";
import { join } from "path";

export const { fs: memory_fs } = memfs();

export async function writeCode(fs: IFs, code: Code, basePath: string) {
  fs.mkdirSync(basePath, { recursive: true });
  Object.entries(code).forEach(([path, content]) =>
    fs.writeFileSync(join(basePath, path), content)
  );
}
