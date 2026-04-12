const esbuild = require('esbuild')

async function main() {
  const ctx = await esbuild.context({
    entryPoints: ['src/debug.ts'],
    bundle: true,
    outfile: 'dist/debug.bundle.js',
    platform: 'browser',
  });
  await ctx.watch();
}

main();
