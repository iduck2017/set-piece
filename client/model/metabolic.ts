import { Factory } from "@/service/factory";
import { Validator } from "@/service/validator";
import { AnimalModel } from "./animal";
import { NodeModel } from "./node";
import { Def } from "@/type/define";
import { Props } from "@/type/props";

type MetaBolicDef = Def.Merge<{
    code: 'metabolic',
    stateDict: {
        calories: number,
    }
    parent: AnimalModel
}>

@Factory.useProduct('metabolic')
export class MetabolicModel extends NodeModel<MetaBolicDef> {
    constructor(props: Props<MetaBolicDef>) {
        super({
            ...props,
            stateDict: {
                calories: 100,
                ...props.stateDict
            },
            childDict: {},
            paramDict: {}
        });
    }

    @Validator.useCondition(model => model.parent.stateDict.isAlive)
    digest() {
        this.baseStateDict.calories -= 1;
    }
}