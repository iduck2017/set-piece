import { NodeDef, Def } from "@/type/define";
import { NodeModel } from "./node";
import { DictChunk, NodeChunkDict } from "@/type/chunk";
import { BaseDictProps } from "@/type/props";
import { Delegator } from "@/util/proxy";

export abstract class DictModel<
    T extends Partial<NodeDef> = NodeDef
> extends NodeModel<T> {
    protected rawChild: NodeChunkDict<Def.Child<T>>;
    readonly child: Readonly<Def.Child<T>>;
    
    constructor(props: BaseDictProps<T, {
        code: string,
        state: {}
        event: {}
        child: {}
        parent: NodeModel
    }>) {
        super(props);
        const origin: any = {};
        for (const key in props.child) {
            origin[key] = this._create(props.child[key]);
        }
        const child = Delegator.Observed<any>(
            origin,
            this._onSpawn.bind(this)
        );
        this.child = Delegator.Readonly(child);
        this.rawChild = Delegator.Formatted(
            child,
            (model: NodeModel) => model?.chunk,
            (chunk) => this._create(chunk) 
        );
    }

    get chunk(): DictChunk<T> {
        return {
            ...super.chunk,
            child: this.rawChild
        };
    }

    debug(): void {
        super.debug();
        console.log({ ...this.child });
    }
}