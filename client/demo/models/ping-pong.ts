import { Base, NodeEvent, Props, NodeModel, 
    Factory, Random, Chunk, Lifecycle, 
    CustomDef } from "@/set-piece";
import { EventEmitter } from "@/set-piece/utils/event";

enum PingPongType {
    Ping = 'ping',
    Pong = 'pong'
}

type PingPongDef = CustomDef<{
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
        onChildParamCheck: NodeEvent.OnParamCheck<PingPongDef>
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
        const onChildParamCheckEmitterList: 
            EventEmitter<NodeEvent.OnParamCheck<PingPongDef>>[] = [];
        const onTriggerEmitterList: EventEmitter<[PingPongType]>[] = [];
        // while (parent instanceof PingPongModel) {
        if (parent instanceof PingPongModel) {
            onTriggerEmitterList.push(parent.eventEmitterDict.onChildTrigger);
            onChildParamCheckEmitterList.push(
                parent.eventEmitterDict.onChildParamCheck
            );
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
            eventInfo: {
                onTrigger: onTriggerEmitterList,
                onParamCheck: onChildParamCheckEmitterList
            }
        });
    }

    trigger() {
        this.eventDict.onTrigger(this.stateDict.type);
    }

    @Lifecycle.useLoader()    
    private _handleTrigger() {
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
        }
    }


    @Lifecycle.useUnloader()
    private _handlePingPongParamCheck() {
        if (this.parent instanceof PingPongModel) {
            this.bindEvent(
                this.parent.eventEmitterDict.onChildParamCheck,
                (model, state) => {
                    state.count += 1;
                }
            );
        }
    }

    appendPingPong(chunk?: Chunk<PingPongDef>) {
        if (!chunk) chunk = { code: 'ping-pong' };
        const target = super.appendChild(chunk);
        return target;
    }

    removePingPong(target?: PingPongModel) {
        if (!target) target = this.childList[0];
        const chunk = super.removeChild(target);
        return chunk;
    }
}
