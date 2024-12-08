import { DictDef, Def } from "@/type/define";
import { NodeModel } from "./node";
import { DictChunk, NodeChunkDict } from "@/type/chunk";
import { BaseDictProps } from "@/type/props";

export abstract class DictModel<
    T extends Partial<DictDef> = DictDef
> extends NodeModel<T> {
    protected rawChild!: NodeChunkDict<Def.Child<T>>;
    readonly child!: Readonly<Def.Child<T>>;
    
    constructor(
        props: BaseDictProps<T, DictDef>
    ) {
        super(props);
    }

    get chunk(): DictChunk<T> {
        return {
            ...super.chunk,
            child: this.rawChild
        };
    }
}