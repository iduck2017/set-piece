import { AppModel } from "./app";
import { BunnyModel } from "./bunny";
import { PingPongModel } from "./ping-pong";
import { Props, NodeModel, FactoryService, LifecycleService, CustomDef } from "@/set-piece";
import { GenderType } from "./reproductive";

type DemoDef = CustomDef<{
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

@FactoryService.useProduct('demo')
export class DemoModel extends NodeModel<DemoDef> {
    constructor(props: Props<DemoDef>) {
        super({
            ...props,
            childDict: { 
                bunny: { 
                    code: 'animal-bunny', 
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
}

