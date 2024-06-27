import { ModelStatus } from "../types/status";
import { Model } from "./base";
import { modelStatus } from "../utils/decors/status";
import { ChildrenOF, ElementOF } from "../types/reflex";
import { ListChunk, ListConfig, ListDefinition } from "../types/list";

export abstract class ListModel<
    T extends ListDefinition
> extends Model<T> {
    private _children: ChildrenOF<T> = [];
    public get children() { return [...this._children]; }

    constructor(config: ListConfig<T>) {
        super(config);
        for (const child of config.children) {
            this.add(child);
        }
    }
    
    @modelStatus(ModelStatus.MOUNTED)
    public get(index: number) {
        return this._children[index];
    }
    
    @modelStatus(
        ModelStatus.MOUNTED,
        ModelStatus.INITED
    )
    public add(child: ElementOF<ChildrenOF<T>>) {
        this._children.push(child);
        child.mount(this);
    }

    @modelStatus(
        ModelStatus.MOUNTED,
        ModelStatus.INITED
    )
    public remove(index: number) {
        const child = this._children[index];
        this._children.splice(index, 1);
        child.unmount();
    }
    
    public serialize(): ListChunk<T> {
        const result = super.serialize();
        return {
            ...result,
            children: this._children.map(item => {
                return item.serialize();
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            }) as any
        };
    }
} 

