export const gcService = new FinalizationRegistry<string>((label) => {
    if (process.env.NODE_ENV === 'test') return;
    console.log(`[Model GC] ${label}`);
});
