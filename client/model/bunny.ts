import { AnimalDef, AnimalModel } from "./animal";
import { Factory } from "@/service/factory";
import { ReproductiveModel } from "./reproductive";
import { Validator } from "@/service/validator";
import { Def } from "@/type/define";
import { Props } from "@/type/props";

type BunnyDef = Def.Merge<{
    code: 'bunny',
    stateDict: {
        age: number,
        readonly name: string,
    },
    childDict: {
        reproductive: ReproductiveModel<BunnyModel>
    },
    eventDict: {}
}>

@Factory.useProduct('bunny')
export class BunnyModel extends AnimalModel<BunnyDef> {
    constructor(props: Props<BunnyDef & AnimalDef>) {
        const superProps = AnimalModel.mergeProps(props);
        super({
            ...props,
            childDict: {
                ...superProps.childDict,
                reproductive: { code: 'reproductive' },
                ...props.childDict
            },
            stateDict: {
                ...superProps.stateDict,
                name: 'bunny',
                age: 0,
                ...props.stateDict
            },
            paramDict: {}
        });
        this.code;
    }
    
    @Validator.useCondition(model => model.stateDict.isAlive)
    growup() {
        this.baseStateDict.age += 1;
    }
}