import { Factory } from "@/service/factory";
import { Lifecycle } from "@/service/lifecycle";
import { Def } from "@/type/define";
import { NodeModel } from "./node";
import { Props } from "@/type/props";

type PingDef = Def.Merge<{
    code: 'ping',
    stateDict: {
        count: number
    },
    childList: Ping[]
}>

@Factory.useProduct('ping')
export class Ping extends NodeModel<PingDef> {
    constructor(props: Props<PingDef>) {
        super({
            ...props,
            childDict: {},
            stateDict: {
                count: 0,
                ...props.stateDict
            },
            paramDict: {}
        });
    }

    count() {
        // this._event.onTrigger(this); 
    }

    @Lifecycle.useLoader()    
    private _count() {
        // this.bind(
        //     Demo.main.child.pings.event.onChildTrigger,
        //     () => {
        //         this._state.value += 1;
        //     }
        // );
    }

    
    append() {
        this._childChunkList.push({ code: 'ping' });
        const ping = this.childList[this.childList.length - 1];
        // this._event.onAppend(ping);
    }

    remove(target?: Ping) {
        if (!target) target = this.childList[0];
        const index = this.childList.indexOf(target);
        if (index < 0) return;
        // this._child.splice(index, 1);
        // this._event.onRemove(target);
    }
}
