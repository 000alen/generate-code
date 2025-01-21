import type {
  Code,
  CompilerError,
  GenerateCodeResult,
} from "@000alen/generate-code-server/dist/types";
import { useState } from "react";
import { UseCodeOptions } from "./types";
import { useMutation } from "@tanstack/react-query";
// import { WebContainer } from "@webcontainer/api";

// const containerPromise = WebContainer.boot();

export function useCode(options: UseCodeOptions) {
  const { api = "/api/code", initialCode = {} } = options;

  const [code, setCode] = useState<Code>(initialCode);
  const [compilerErrors, setCompilerErrors] = useState<CompilerError[]>([]);

  const { mutateAsync: generate } = useMutation({
    mutationKey: [api, code, compilerErrors],
    mutationFn: async ({ prompt }: { prompt: string }) => {
      // const container = await containerPromise;
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

      return (await response.json()) as GenerateCodeResult;
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

