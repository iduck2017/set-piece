import { FactoryService, Model, Props } from "@/set-piece";
import { EnrageDef, EnrageModel } from "@/hearthstone/models/enrage";
import { CombativeModel } from "@/hearthstone/models/combative";
import { Mutator } from "@/set-piece/utils/mutator";

export type FeatureAmaniBerserkerDef = EnrageDef<{
    code: 'amani-berserker-enrage-feature',
    stateDict: {
        isEnraged: boolean
    }
}>

@FactoryService.useProduct('amani-berserker-enrage-feature')
export class AmaniBerserkerFeatureModel extends EnrageModel<FeatureAmaniBerserkerDef> {
    constructor(props: Props<FeatureAmaniBerserkerDef>) {
        super({
            ...props,
            paramDict: {
                name: 'Amani Berserker\'s Effect',
                desc: '+3 Attack when damaged.'
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
        param.data.attack += 3;
    }
} 