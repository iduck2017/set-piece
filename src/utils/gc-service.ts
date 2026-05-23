export const gcService = new FinalizationRegistry<string>((label) => {
    console.log(`[Model GC] ${label}`);
});
