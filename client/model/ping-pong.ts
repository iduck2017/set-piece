import { IModel, Model } from ".";
import { Factory } from "@/service/factory";
import { ChunkOf, OnModelCheck } from "@/type/model";


@Factory.useProduct('pings')
export class Pings extends IModel<
    'pings',
    {},
    Ping[],
    {
        onPingCheck: OnModelCheck<Ping>,
        onPingAppend: {
            target: Ping, 
        }
        onPingRemove: {
            target: Ping
        }
    }
> {
    constructor(
        chunk: ChunkOf<Pings>,
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
        this._child.push({ code: 'ping' });
        const ping = this.child[this._child.length - 1];
        this._event.onPingAppend({
            target: ping
        });
    }

    remove(target: Ping) {
        const index = this.child.indexOf(target);
        if (index < 0) return;
        this._child.splice(index, 1);
        this._event.onPingRemove({
            target
        });
    }
}


@Factory.useProduct('pongs')
export class Pongs<
    C extends Model = Model
> extends IModel<
    'pongs',
    {},
    C[],
    {}
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

    append(chunk: ChunkOf<C>) {
        console.log('append', chunk);
        this._child.push(chunk);
    }

    remove(target: C) {
        const index = this.child.indexOf(target);
        if (index < 0) return;
        this._child.splice(index, 1);
    }
}

@Factory.useProduct('ping')
export class Ping extends IModel<
    'ping',
    {
        count: number;
    },
    {},
    {}
> {
    constructor(
        chunk: ChunkOf<Ping>,
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
