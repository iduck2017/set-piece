import { AnimalModel } from "./animal";
import { Def, Props, NodeModel, Validator, Factory } from "@/set-piece";

type MetaBolicDef = Def.Create<{
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