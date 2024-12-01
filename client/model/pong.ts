import { Factory } from "@/service/factory";
import { IModel, Model } from ".";
import { ChunkOf } from "@/type/model";
import { OnModelCheck } from "@/type/event";
import { Lifecycle } from "@/service/lifecycle";
import { App } from "./app";
import { Demo } from "./demo";
import { Decor } from "@/service/decor";

@Factory.useProduct('pongs')
export class Pongs extends IModel<
    'pongs',
    {},
    Pong[],
    {
        onChildCheck: OnModelCheck<Pong>,
        onAppend: Pong
        onRemove: Pong
        onChildTrigger: Pong
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
        this._event.onAppend(pong);
    }

    remove(target?: Pong) {
        if (!target) target = this.child[0];
        const index = this.child.indexOf(target);
        if (index < 0) return;
        this._child.splice(index, 1);
        this._event.onRemove(target);
    }
}


@Factory.useProduct('pong')
export class Pong extends IModel<
    'pong',
    {
        value: number;
    },
    {},
    {
        onTrigger: Pong
    }
> {
    declare parent: Pongs;

    constructor(
        chunk: ChunkOf<Pong>,
        parent: Pongs
    ) {
        super({
            ...chunk,
            child: {},
            state: {
                value: 0,
                ...chunk.state
            },
            event: {
                onTrigger: [ parent.event.onChildTrigger ]
            }
        }, parent);
    }

    trigger() {
        this._event.onTrigger(this); 
    }

    @Lifecycle.useLoader()    
    private _onLoad() {
        this.bind(
            Demo.main.child.pings.event.onChildTrigger,
            () => {
                this._state.value += 1;
            }
        );
    }

}
