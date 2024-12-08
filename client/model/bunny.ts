import { AnimalModel } from "./animal";
import { NodeProps } from "@/type/props";

type BunnyDef = {
    code: 'bunny',
    state: {
        name: string,
    },
    child: {},
    event: {}
}

export class BunnyModel extends AnimalModel<BunnyDef> {
    constructor(props: NodeProps<BunnyDef>) {
        super({
            ...props,
            child: {
                ...props.child
            },
            state: {
                name: 'bunny',
                ...props.state
            }
        });
    }

    debug() {
        this.state.name;
    }
}