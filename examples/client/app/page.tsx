"use client";

import { useCode } from "@000alen/generate-code-client";
import type { Code } from "@000alen/generate-code-server/dist/types";
import { useCallback, useState } from "react";

const initialCode: Code = {
  "types.ts": "export interface User { name: string; }",
};

export default function Page() {
  const { generate, code, compilerErrors } = useCode({ initialCode });

  const [prompt, setPrompt] = useState("Create a user for Felipe");

  const onClick = useCallback(() => {
    generate(
      {
        prompt,
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
  }, [generate, prompt]);

  return (
    <div>
      <h1>Generate Code Examples</h1>

      <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} />

      <button onClick={onClick}>Generate</button>
      <pre>{JSON.stringify(code, null, 2)}</pre>
      <pre>{JSON.stringify(compilerErrors, null, 2)}</pre>
    </div>
  );
}
