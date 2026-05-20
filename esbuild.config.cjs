const esbuild = require('esbuild')

async function main() {
  const ctx = await esbuild.context({
    entryPoints: ['src/model.public.ts', 'src/view.public.ts'],
    bundle: true,
    outdir: 'dist',
    platform: 'browser',
    format: 'esm',
  });
  await ctx.watch();
}

main();
