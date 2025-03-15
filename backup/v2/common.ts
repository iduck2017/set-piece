
export type BaseValue = 
    string | number | boolean | undefined |
    Record<string, string | number | boolean | undefined> |
    Array<string | number | boolean | undefined>
