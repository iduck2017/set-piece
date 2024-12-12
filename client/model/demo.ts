import { Factory } from "@/service/factory";
import { AppModel } from "./app";
import { Lifecycle } from "@/service/lifecycle";
import { Def } from "@/type/define";
import { NodeModel } from "./node";
import { Props } from "@/type/props";

type DemoDef = Def.Merge<{
    code: 'demo',
    parent: AppModel,
    stateDict: {
        count: number
    }
}>

@Factory.useProduct('demo')
export class DemoModel extends NodeModel<DemoDef> {
    private static _core?: DemoModel;
    static get core(): DemoModel {
        if (!DemoModel._core) {
            console.error('demo-uninited');
            throw new Error();
        }
        return DemoModel._core;
    }

    constructor(props: Props<DemoDef>) {
        super({
            ...props,
            childDict: { 
                // bunny: { 
                //     code: 'bunny', 
                //     child: {
                //         reproductive: {
                //             code: 'reproductive',
                //             state: {
                //                 gender: Gender.Female
                //             }
                //         }
                //     } 
                // },
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

