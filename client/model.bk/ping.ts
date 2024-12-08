import { IModel, Model } from ".";
import { Factory } from "@/service/factory";
import { OnModelCheck } from "@/type/event";
import { ChunkOf } from "@/type/define";
import { Demo } from "./demo";
import { Lifecycle } from "@/service/lifecycle";
import { Decor } from "@/service/decor";

@Factory.useProduct('pings')
export class Pings extends IModel<
    'pings',
    {},
    Ping[],
    {
        onChildCheck: OnModelCheck<Ping>,
        onAppend: Ping
        onRemove: Ping
        onChildTrigger: Ping
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
        this._event.onAppend(ping);
    }

    remove(target?: Ping) {
        if (!target) target = this.child[0];
        const index = this.child.indexOf(target);
        if (index < 0) return;
        this._child.splice(index, 1);
        this._event.onRemove(target);
    }
}


@Factory.useProduct('ping')
@Decor.useMutators({
    count: true
})
export class Ping extends IModel<
    'ping',
    {
        value: number;
        readonly count: number;
    },
    {},
    {
        onTrigger: Ping 
    }
> {
    declare parent: Pings;

    constructor(
        chunk: ChunkOf<Ping>,
        parent: Pings
    ) {
        super({
            ...chunk,
            child: {},
            state: {
                count: 0,
                value: 0,
                ...chunk.state
            },
            event: {
                onTrigger: [ parent.event.onChildTrigger ],
                onModelCheck: [ parent.event.onChildCheck ]
            }
        }, parent);
    }

    trigger() {
        this._event.onTrigger(this);
    }

    @Lifecycle.useLoader()    
    private _onLoad() {
        this.bind(
            Demo.main.child.pongs.event.onChildTrigger,
            () => {
                this._state.value += 1;
            }
        );
        this.bind(
            Demo.main.child.pings.event.onChildCheck,
            (target, data) => {
                data.next.count += 1;
            }
        );
    }

}