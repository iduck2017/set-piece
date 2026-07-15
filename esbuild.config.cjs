const esbuild = require('esbuild')

async function main() {
  const ctx = await esbuild.context({
    entryPoints: ['src/debug.ts'],
    bundle: true,
    outfile: 'dist/debug.js',
    platform: 'browser',
    format: 'esm',
  });
  await ctx.watch();
}

main();
