import { Factory } from "@/service/factory";
import { DictModel } from "./dict";
import { NodeProps } from "@/type/props";
import { Validator } from "@/service/validator";
import { AnimalModel } from "./animal";

type MetaBolicDef = {
    code: 'metabolic',
    state: {
        calories: number,
    }
    parent: AnimalModel
}

@Factory.useProduct('metabolic')
export class MetabolicModel extends DictModel<MetaBolicDef> {
    constructor(props: NodeProps<MetaBolicDef>) {
        super({
            ...props,
            state: {
                calories: 100,
                ...props.state
            },
            child: {}
        });
    }

    @Validator.useCondition(model => model.parent.state.isAlive)
    digest() {
        this.rawState.calories -= 1;
    }
}