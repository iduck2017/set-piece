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
    constructor(
        chunk: NodeProps<BunnyDef>
    ) {
        super({
            ...chunk,
            child: {
                ...chunk.child
            },
            state: {
                name: 'bunny',
                ...chunk.state
            }
        });
    }

    debug() {
        this.state.name;
    }
}