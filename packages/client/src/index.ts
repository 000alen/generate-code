import { WebContainer } from "@webcontainer/api";

const containerPromise = WebContainer.boot();

export async function main() {
  const container = await containerPromise;
}

export function useCode() {
}
