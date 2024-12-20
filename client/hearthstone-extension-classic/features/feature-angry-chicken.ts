import { CustomDef, Factory, Model, Props } from "@/set-piece";
import { EnrageDef, EnrageModel } from "@/hearthstone/models/enrage";
import { AngryChickenModel } from "../minions/minion-angry-chicken";
import { CombatableModel } from "@/hearthstone/models/combatable";
import { Mutable } from "utility-types";

export type FeatureAngryChickenDef = EnrageDef<
    CustomDef<{
        code: 'feature-angry-chicken',
        stateDict: {
            isEnraged: boolean
        }
    }>
>

@Factory.useProduct('feature-angry-chicken')
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
        target: CombatableModel,
        param: Mutable<Model.ParamDict<CombatableModel>>
    ) {
        param.attack += 5;
    }
} 