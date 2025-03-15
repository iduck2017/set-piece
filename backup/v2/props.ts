import { ChildChunk } from "./chunk";
import { Def } from "./define";

export type Props<T extends Def> = {
    uuid: string;
    code: Def.Code<T>;
    state?: Partial<Def.State<T> & Def.StateInner<T>>;
    child?: Partial<ChildChunk<T>>;
    parent: Def.Parent<T>;
}

export type BaseProps<T extends Def> = {
    uuid: string;
    code: Def.Code<T>;
    state: Def.State<T> & Def.StateInner<T>;
    child: ChildChunk<T>;
    parent: Def.Parent<T>;
}