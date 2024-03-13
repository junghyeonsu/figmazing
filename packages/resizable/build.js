const { build } = require("esbuild");

const run = ({ entryPoints = ["./src/index.ts"], pkg }) => {
  const dev = process.argv.includes("--watch");

  const external = Object.keys({
    ...pkg.dependencies,
    ...pkg.peerDependencies,
  });

  const minify = !dev;

  const baseConfig = {
    entryPoints,
    outdir: "dist",
    target: "es2019",
    bundle: true,
    sourcemap: true,
    external,
    minify,
  };

  Promise.all([
    build({
      ...baseConfig,
      format: "cjs",
    }),
    build({
      ...baseConfig,
      format: "esm",
      outExtension: {
        ".js": ".mjs",
      },
    }),
  ]).catch(() => process.exit(1));
};

run({
  entryPoints: ["./src/index.ts", "./src/main.ts"],
  pkg: require("./package.json"),
});
