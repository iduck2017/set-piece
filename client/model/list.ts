import { IModel, Model } from ".";
import { Factory } from "@/service/factory";
import { Chunk, ChunkOf } from "@/type/model";

@Factory.useProduct('pure_list')
export class PureList<
    C extends Model = Model
> extends IModel<
    'pure_list',
    {},
    C[],
    {}
> {
    constructor(
        chunk: ChunkOf<PureList>,
        parent: Model
    ) {
        const child: any = [];
        super({
            ...chunk,
            child: chunk.child || child,
            state: {}
        }, parent);
    }

    push(chunk: ChunkOf<C>) {
        this._child.push(chunk);
    }

    remove(target: C) {
        const index = this.child.indexOf(target);
        if (index < 0) return;
        this._child.splice(index, 1);
    }
}

