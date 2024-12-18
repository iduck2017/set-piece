import { Def, Factory, Lifecycle, Model, Props } from "@/set-piece";
import { FeatureDef, FeatureModel } from "../feature";
import { AngryChickenModel } from "../minions/angry-chicken";
import { CombatableModel } from "../combatable";
import { Mutable } from "utility-types";

export type FeatureAngryChickenDef = FeatureDef<
    Def.Create<{
        code: 'feature-angry-chicken',
        parent: AngryChickenModel,
        stateDict: {
            isEnraged: boolean
        }
    }>
>

@Factory.useProduct('feature-angry-chicken')
export class FeatureAngryChickenModel extends FeatureModel<FeatureAngryChickenDef> {
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

    @Lifecycle.useLoader()
    private _handleEnrage() {
        const minion = this.refer.minion;
        const combatable = this.refer.minionCombatable;
        if (!minion || !combatable) return;

        this.bindEvent(
            combatable.eventEmitterDict.onStateAlter,
            () => {
                const isDamaged = 
                    combatable.stateDict.curHealth < combatable.stateDict.maxHealth;
                if (isDamaged && !this.stateDict.isEnraged) {
                    this.bindEvent(
                        combatable.eventEmitterDict.onParamCheck,
                        this.addAttack
                    );
                } else if (!isDamaged && this.stateDict.isEnraged) {
                    this.unbindEvent(
                        combatable.eventEmitterDict.onParamCheck,
                        this.addAttack
                    );
                }
            }
        );
    }

    private addAttack(
        target: CombatableModel,
        param: Mutable<Model.StateDict<CombatableModel>>
    ) {
        param.attack += 5;
    }
} 