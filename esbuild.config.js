const esbuild = require('esbuild')

async function main() {
  const ctx = await esbuild.context({
    entryPoints: ['src/index.ts'],
    bundle: true,
    outfile: 'dist/index.bundle.js',
    platform: 'browser',
  });
  await ctx.watch();
}

main();
