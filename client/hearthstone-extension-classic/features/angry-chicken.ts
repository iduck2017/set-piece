import { FactoryService, Model, Props } from "@/set-piece";
import { EnrageDef, EnrageModel } from "@/hearthstone/models/enrage";
import { CombativeModel } from "@/hearthstone/models/combative";
import { Mutator } from "@/set-piece/utils/mutator";

export type FeatureAngryChickenDef = EnrageDef<{
    code: 'angry-chicken-enrage-feature',
    stateDict: {
        isEnraged: boolean
    }
}>

@FactoryService.useProduct('angry-chicken-enrage-feature')
export class AngryChickenEnrageModel extends EnrageModel<FeatureAngryChickenDef> {
    constructor(props: Props<FeatureAngryChickenDef>) {
        super({
            ...props,
            paramDict: {
                name: 'Angry Chicken\'s Effect',
                desc: '+5 Attack when damaged.'
            },
            stateDict: {
                isEnraged: false
            },
            childDict: {}
        });
    }

    protected enrage(
        target: CombativeModel,
        param: Mutator<Model.ParamDict<CombativeModel>>
    ) {
        param.data.attack += 5;
    }
} 