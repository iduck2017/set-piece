import { Model } from "./model"

export type PrimitiveValue = string | number | boolean | undefined;
export type BaseValue = PrimitiveValue | PrimitiveValue[] | Record<string, PrimitiveValue>;


