export const files = {
  "package.json": {
    file: {
      contents: JSON.stringify({
        name: "container",
        version: "1.0.0",
        type: "module",
        scripts: {
          build: "tsc",
        },
        dependencies: {
          typescript: "^5.7.3",
        },
        devDependencies: {},
      }),
    },
  },
  "tsconfig.json": {
    file: {
      contents: JSON.stringify({
        include: ["./src"],
        exclude: ["./node_modules/**/*", "./dist/**/*"],
        compilerOptions: {
          disableSizeLimit: true,
          declaration: true,
          target: "ESNext",
          module: "ESNext",
          moduleResolution: "node",
          forceConsistentCasingInFileNames: true,
          strict: true,
          skipLibCheck: true,
          esModuleInterop: true,
          resolveJsonModule: true,
          allowJs: true,
          downlevelIteration: true,
          inlineSourceMap: true,
          experimentalDecorators: true,
          jsx: "react-jsx",
          outDir: "./dist",
          rootDir: "./src",
        },
      }),
    },
    src: {
      directory: {},
    },
  },
};
