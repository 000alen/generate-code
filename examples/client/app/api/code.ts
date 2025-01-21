export const POST = async (request: Request) => {
  const { code, compilerErrors } = (await request.json()) as any;

  console.log(code, compilerErrors);

  return new Response("Hello World");
};
