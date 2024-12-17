import { AppModel } from "./app";
import { BunnyModel } from "./bunny";
import { PingPongModel } from "./ping-pong";
import { Def, Props, NodeModel, Factory, Lifecycle } from "@/set-piece";
import { GenderType } from "./reproductive";

type DemoDef = Def.Create<{
    code: 'demo',
    parent: AppModel,
    childDict: {
        bunny: BunnyModel
        pingPong: PingPongModel
    },
    stateDict: {
        count: number
    }
}>

@Factory.useProduct('demo')
export class DemoModel extends NodeModel<DemoDef> {
    private static _core?: DemoModel;
    static get core(): DemoModel {
        if (!DemoModel._core) {
            console.error('[demo-uninited]');
            throw new Error();
        }
        return DemoModel._core;
    }

    constructor(props: Props<DemoDef>) {
        super({
            ...props,
            childDict: { 
                bunny: { 
                    code: 'bunny', 
                    childDict: {
                        reproductive: {
                            code: 'reproductive',
                            stateDict: {
                                gender: GenderType.Female
                            }
                        }
                    }
                },
                pingPong: {
                    code: 'ping-pong'
                },
                ...props.childDict
            },
            paramDict: {},
            stateDict: {
                count: 0,
                ...props.stateDict
            }
        });
    }

    count() {
        this.baseStateDict.count++;
    }

    @Lifecycle.useLoader()
    private _register() {
        DemoModel._core = this;
    }

    @Lifecycle.useUnloader()
    private _unregister() {
        delete DemoModel._core;
    }
}

