import { Factory } from "@/service/factory";
import { IModel, Model } from ".";
import { ChunkOf, OnModelCheck } from "@/type/model";

@Factory.useProduct('pongs')
export class Pongs extends IModel<
    'pongs',
    {},
    Pong[],
    {
        onPongCheck: OnModelCheck<Pong>,
        onPongAppend: {
            target: Pong, 
        }
        onPongRemove: {
            target: Pong
        }
    }
> {
    constructor(
        chunk: ChunkOf<Pongs>,
        parent: Model
    ) {
        const child: any = [];
        super({
            child,
            ...chunk,
            state: {}
        }, parent);
    }

    append() {
        this._child.push({ code: 'pong' });
        const pong = this.child[this._child.length - 1];
        this._event.onPongAppend({
            target: pong
        });
    }

    remove(target: Pong) {
        const index = this.child.indexOf(target);
        if (index < 0) return;
        this._child.splice(index, 1);
        this._event.onPongRemove({
            target
        });
    }
}


@Factory.useProduct('pong')
export class Pong extends IModel<
    'pong',
    {
        count: number;
    },
    {},
    {}
> {
    constructor(
        chunk: ChunkOf<Pong>,
        parent: Model
    ) {
        super({
            ...chunk,
            child: {},
            state: {
                count: 0,
                ...chunk.state
            }
        }, parent);
    }
}
