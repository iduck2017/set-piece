import { Factory } from "@/service/factory";
import { AppModel } from "./app";
import { DictModel } from "./dict";
import { NodeProps } from "@/type/props";
import { Lifecycle } from "@/service/lifecycle";
import { BunnyModel } from "./bunny";
import { Gender } from "./reproductive";

type DemoDef = {
    code: 'demo',
    state: {
        count: number,
    },
    child: {
        bunny: BunnyModel
    }
    parent: AppModel
}

@Factory.useProduct('demo')
export class DemoModel extends DictModel<DemoDef> {
    private static _core?: DemoModel;
    static get core(): DemoModel {
        if (!DemoModel._core) {
            console.error('DemoUninited');
            throw new Error();
        }
        return DemoModel._core;
    }

    constructor(props: NodeProps<DemoDef>) {
        super({
            ...props,
            child: { 
                bunny: { 
                    code: 'bunny', 
                    child: {
                        reproductive: {
                            code: 'reproductive',
                            state: {
                                gender: Gender.Female
                            }
                        }
                    } 
                },
                ...props.child
            },
            state: {
                count: 0,
                ...props.state
            }
        });
    }

    count() {
        this.rawState.count++;
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

