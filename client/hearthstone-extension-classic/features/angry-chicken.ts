import { CustomDef, FactoryService, Model, Props } from "@/set-piece";
import { EnrageDef, EnrageModel } from "@/hearthstone/models/enrage";
import { AngryChickenModel } from "../minions/angry-chicken";
import { CombativeModel } from "@/hearthstone/models/combative";
import { Mutable } from "utility-types";

export type FeatureAngryChickenDef = EnrageDef<
    CustomDef<{
        code: 'angry-chicken-feature',
        stateDict: {
            isEnraged: boolean
        }
    }>
>

@FactoryService.useProduct('angry-chicken-feature')
export class FeatureAngryChickenModel extends EnrageModel<FeatureAngryChickenDef> {
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

    protected handleEnrage(
        target: CombativeModel,
        param: Mutable<Model.ParamDict<CombativeModel>>
    ) {
        param.attack += 5;
    }
} 