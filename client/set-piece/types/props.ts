import { NodeEvent } from "@/set-piece/node";
import { Base, Dict } from "./base";
import { Chunk } from "./chunk";
import { Def } from "./define";
import { Event } from "./event";
import { Model } from "./model";

export type Props<T extends Def> = {
    uuid?: string,
    code: Def.Code<T>,
    childDict?: Partial<Dict.Strict<Chunk.Dict<Def.ChildDict<T>>>>,
    childList?: Base.List<Model.Chunk<Def.ChildList<T>[number]>>
    stateDict?: Partial<Dict.Strict<Def.StateDict<T>>>,
    parent: Def.Parent<T>,
}


export namespace Props {
    export type Strict<T extends Def> = {
        uuid?: string,
        code: Def.Code<T>,
        childDict: Dict.Strict<Chunk.Dict<Def.ChildDict<T>>>,
        childList?: Base.List<Model.Chunk<Def.ChildList<T>[number]>>,
        stateDict: Dict.Strict<Def.StateDict<T>>,
        paramDict: Dict.Strict<Def.ParamDict<T>>,
        eventInfo?: Partial<Dict.Strict<Event.EmitterInfo<NodeEvent<T> & Def.EventDict<T>>>>
        parent: Def.Parent<T>,
    }
}
