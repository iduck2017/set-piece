import { ListDef, Def } from "@/type/define";
import { Model, NodeModel } from "./node";
import { ListChunk } from "@/type/chunk";
import { Base } from "@/type/base";
import { BaseListProps } from "@/type/props";
import { Delegator } from "@/util/proxy";

export abstract class ListModel<
    T extends Partial<ListDef> = ListDef
> extends NodeModel<T> {
    protected rawChild: Base.List<Model.Chunk<Def.Child<T>[number]>>;
    readonly child: Readonly<Def.Child<T>>;

    constructor(props: BaseListProps<T>) {
        super(props);
        const child = Delegator.Observed<any>(
            props.child.map(chunk => this._create(chunk)),
            this._onSpawn.bind(this)
        );
        this.child = Delegator.Readonly(child);
        this.rawChild = Delegator.Formatted(
            child,
            (model: NodeModel) => model?.chunk,
            (chunk) => this._create(chunk) 
        );
    }

    get chunk(): ListChunk<T> {
        return {
            ...super.chunk,
            child: this.rawChild
        };
    }
}