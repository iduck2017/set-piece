import { AnimalModel } from "./animal";
import { NodeProps } from "@/type/props";
import { Factory } from "@/service/factory";
import { ReproductiveModel } from "./reproductive";
import { Validator } from "@/service/validator";

type BunnyDef = {
    code: 'bunny',
    state: {
        age: number,
        name: string,
    },
    child: {
        reproductive: ReproductiveModel<BunnyModel>
    },
    event: {}
}

@Factory.useProduct('bunny')
export class BunnyModel extends AnimalModel<BunnyDef> {
    constructor(props: NodeProps<BunnyDef>) {
        super({
            ...props,
            child: {
                reproductive: { code: 'reproductive' },
                ...props.child
            },
            state: {
                name: 'bunny',
                age: 0,
                ...props.state
            }
        });
        this.code;
    }
    
    @Validator.useCondition(model => model.state.isAlive)
    growup() {
        this.rawState.age += 1;
    }

    debug(): void {
        super.debug();
    }
}