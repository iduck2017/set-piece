import { ListDef, Def } from "@/type/define";
import { Model, NodeModel } from "./node";
import { ListChunk } from "@/type/chunk";
import { Base } from "@/type/base";
import { BaseListProps } from "@/type/props";

export abstract class ListModel<
    T extends Partial<ListDef> = ListDef
> extends NodeModel<T> {
    protected rawChild!: Base.List<Model.Chunk<Def.Child<T>[number]>>;
    readonly child!: Readonly<Def.Child<T>>;

    constructor(
        props: BaseListProps<T>
    ) {
        super(props);
    }

    get chunk(): ListChunk<T> {
        return {
            ...super.chunk,
            child: this.child
        };
    }
}