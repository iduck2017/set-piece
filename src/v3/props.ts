import { ChildChunk, ChildGroupChunk } from "./chunk";
import { BaseValue } from "./common";
import { BaseModel } from "./model";

export type Props<
    I extends string,
    S extends Record<string, BaseValue>,
    D extends Record<string, BaseValue>,
    C extends Record<string, BaseModel>,
    G extends Record<string, BaseModel[]>,
    P extends BaseModel | undefined,
> = {
    uuid: string;
    code: I;
    state?: Partial<S & D>;
    child?: Partial<ChildChunk<C>>;
    childGroup?: Partial<ChildGroupChunk<G>>;
    parent: P;
}

export type BaseProps<
    I extends string,
    S extends Record<string, BaseValue>,
    D extends Record<string, BaseValue>,
    C extends Record<string, BaseModel>,
    G extends Record<string, BaseModel[]>,
    P extends BaseModel | undefined,
> = {
    uuid: string;
    code: I;
    state: S & D;
    child: ChildChunk<C>;
    childGroup: ChildGroupChunk<G>;
    parent: P;
}