"use client";

import { useCode } from "@000alen/generate-code-client";
import type { Code } from "@000alen/generate-code-server/dist/types";
import { useCallback } from "react";

const initialCode: Code = {
  "types.ts": "export interface User { name: string; }",
};

export default function Page() {
  const { generate, code, compilerErrors } = useCode({ initialCode });

  const onClick = useCallback(() => {
    generate(
      {
        prompt: "Create a user for Felipe",
      },
      {
        onSuccess: (data) => {
          console.log(data);
        },
        onError: (error) => {
          console.error(error);
        },
      }
    );
  }, [generate]);

  return (
    <div>
      <h1>Generate Code Examples</h1>
      <button onClick={onClick}>Generate</button>
      <pre>{JSON.stringify(code, null, 2)}</pre>
      <pre>{JSON.stringify(compilerErrors, null, 2)}</pre>
    </div>
  );
}
