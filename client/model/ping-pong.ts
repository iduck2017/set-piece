import { Factory } from "@/service/factory";
import { Lifecycle } from "@/service/lifecycle";
import { Def } from "@/type/define";
import { NodeEvent, NodeModel } from "./node";
import { Props } from "@/type/props";
import { Base } from "@/type/base";
import { Event } from "@/type/event";
import { Random } from "@/util/random";

enum PingPongType {
    Ping = 'ping',
    Pong = 'pong'
}

type PingPongDef = Def.Merge<{
    code: 'ping-pong',
    stateDict: {
        readonly type: PingPongType
        value: number
    },
    paramDict: {
        count: number 
    },
    childList: Base.List<PingPongModel>,
    eventDict: {
        onChildStateCheck: NodeEvent.OnStateCheck<PingPongDef>
        onChildTrigger: [PingPongType]
        onTrigger: [PingPongType],
        onChildAppend: [PingPongModel | undefined],
        onChildRemove: [PingPongModel]
    },
}>

@Factory.useProduct('ping-pong')
export class PingPongModel extends NodeModel<PingPongDef> {
    constructor(props: Props<PingPongDef>) {
        const parent = props.parent;
        const onChildStateCheckEmitterList: 
            Event.Emitter<NodeEvent.OnStateCheck<PingPongDef>>[] = [];
        const onTriggerEmitterList: Event.Emitter<[PingPongType]>[] = [];
        // while (parent instanceof PingPongModel) {
        if (parent instanceof PingPongModel) {
            onTriggerEmitterList.push(parent.eventEmitterDict.onChildTrigger);
            onChildStateCheckEmitterList.push(parent.eventEmitterDict.onChildStateCheck);
            // parent = parent.parent;
        }
        super({
            childList: [],
            ...props,
            childDict: {},
            stateDict: {
                value: 0,
                type: Random.type(PingPongType),
                ...props.stateDict
            },
            paramDict: {
                count: 0
            },
            eventGrid: {
                onTrigger: onTriggerEmitterList,
                onStateCheck: onChildStateCheckEmitterList
            }
        });
    }

    trigger() {
        this.eventDict.onTrigger(this.stateDict.type);
    }

    @Lifecycle.useLoader()    
    private _listenPingPong() {
        if (this.parent instanceof PingPongModel) {
            this.bindEvent(
                this.parent.eventEmitterDict.onChildTrigger,
                (type) => {
                    if (type === this.stateDict.type) {
                        this.baseStateDict.value += 1;
                    } else {
                        this.baseStateDict.value -= 1;
                    }
                }
            );
            this.bindEvent(
                this.parent.eventEmitterDict.onChildStateCheck,
                (model, state) => {
                    state.count += 1;
                }
            );
        }
    }

    
    appendChild() {
        const uuid = Factory.uuid;
        this._childChunkList.push({ 
            code: 'ping-pong',
            uuid 
        });
        const child = this.childList.find((child) => child.uuid === uuid);
        this.eventDict.onChildAppend(child);
        return child;
    }

    removeChild(target?: PingPongModel) {
        if (!target) target = this.childList[this.childList.length - 1];

        const index = this.childList.indexOf(target);
        if (index < 0) return;

        this._childChunkList.splice(index, 1);
        this.eventDict.onChildRemove(target);
    }
}
