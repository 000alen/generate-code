"use client";

import type {
  Code,
  CompilerError,
  GenerateCodeResult,
} from "@000alen/generate-code-server/dist/types";
import { useEffect, useRef, useState } from "react";
import { UseCodeOptions } from "./types";
import { useMutation } from "@tanstack/react-query";
import { WebContainer } from "@webcontainer/api";
import { files } from "./files";

// const containerPromise = WebContainer.boot();

export function useCode(options: UseCodeOptions) {
  const { api = "/api/code", initialCode = {} } = options;

  const containerPromiseRef = useRef<Promise<WebContainer> | null>(null);
  useEffect(() => {
    if (!!containerPromiseRef.current) return;

    containerPromiseRef.current = WebContainer.boot();

    containerPromiseRef.current.then((container) => {
      console.log("container", container);
    });
  }, []);

  const [code, setCode] = useState<Code>(initialCode);
  const [compilerErrors, setCompilerErrors] = useState<CompilerError[]>([]);

  const { mutateAsync: generate } = useMutation({
    mutationKey: [api, code, compilerErrors],
    mutationFn: async ({ prompt }: { prompt: string }) => {
      const container = await containerPromiseRef.current!;

      console.log("mounting files");
      await container.mount(files);

      console.log("installing dependencies");
      await container.spawn("npm", ["install"]);

      console.log("generating code");
      const response = await fetch(api, {
        method: "POST",
        body: JSON.stringify({
          code,
          compilerErrors,
          prompt,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error("Failed to generate code");

      const result = (await response.json()) as GenerateCodeResult;

      console.log("writing files");
      await container.fs.mkdir("src");
      await Promise.all(
        Object.entries(result.code).map(([path, content]) =>
          container.fs.writeFile(`src/${path}`, content)
        )
      );

      console.log("building code");
      const buildProcess = await container.spawn("npm", ["run", "build"]);
      buildProcess.output.pipeTo(
        new WritableStream({
          write(data) {
            console.log(data);
          },
        })
      );

      return result;
    },
    onSuccess: (data) => {
      setCode(data.code);
      setCompilerErrors(data.compilerErrors);
    },
  });

  return {
    generate,
    code,
    compilerErrors,
  };
}
