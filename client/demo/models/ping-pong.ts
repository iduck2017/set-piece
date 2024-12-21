import { Base, NodeEvent, Props, NodeModel, 
    FactoryService, Random, Chunk, LifecycleService, 
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
        onChildParamCheck: NodeEvent.OnStateAlterBefore<PingPongModel>
        onChildTrigger: [PingPongType]
        onTrigger: [PingPongType],
        onChildAppend: [PingPongModel | undefined],
        onChildRemove: [PingPongModel]
    },
}>

@FactoryService.useProduct('ping-pong')
export class PingPongModel extends NodeModel<PingPongDef> {
    constructor(props: Props<PingPongDef>) {
        const parent = props.parent;
        const onChildStateAlterBeforeEmitterList: 
            EventEmitter<NodeEvent.OnStateAlterBefore<PingPongModel>>[] = [];
        const onTriggerEmitterList: EventEmitter<[PingPongType]>[] = [];
        // while (parent instanceof PingPongModel) {
        if (parent instanceof PingPongModel) {
            onTriggerEmitterList.push(parent.eventEmitterDict.onChildTrigger);
            onChildStateAlterBeforeEmitterList.push(
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
                onStateAlterBefore: onChildStateAlterBeforeEmitterList
            }
        });
    }

    trigger() {
        this.eventDict.onTrigger(this.stateDict.type);
    }

    @LifecycleService.useLoader()    
    private _listenTrigger() {
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


    @LifecycleService.useUnloader()
    private _listenPingPongCheck() {
        if (this.parent instanceof PingPongModel) {
            this.bindEvent(
                this.parent.eventEmitterDict.onChildParamCheck,
                (model, state) => {
                    state.data.count += 1;
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
