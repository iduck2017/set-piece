import { AnimalDef, AnimalModel } from "./animal";
import { Def, Props, Factory, Validator } from "@/set-piece";
import { ReproductiveModel } from "./reproductive";

type BunnyDef = Def.Create<{
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
        const superProps = AnimalModel.superProps(props);
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
    }
    
    @Validator.useCondition(model => model.stateDict.isAlive)
    growup() {
        this.baseStateDict.age += 1;
    }
}