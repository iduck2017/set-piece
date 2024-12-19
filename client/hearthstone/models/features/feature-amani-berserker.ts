import { Def, Factory, Lifecycle, Model, Props } from "@/set-piece";
import { FeatureDef, FeatureModel } from "../feature";
import { AmaniBerserkerModel } from "../minions/amani-berserker";
import { CombatableModel } from "../combatable";
import { Mutable } from "utility-types";

export type FeatureAmaniBerserkerDef = FeatureDef<
    Def.Create<{
        code: 'feature-amani-berserker',
        parent: AmaniBerserkerModel,
        stateDict: {
            isEnraged: boolean
        }
    }>
>

@Factory.useProduct('feature-amani-berserker')
export class FeatureAmaniBerserkerModel extends FeatureModel<FeatureAmaniBerserkerDef> {
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
                    this.baseStateDict.isEnraged = true;
                    this.bindEvent(
                        combatable.eventEmitterDict.onParamCheck,
                        this.addAttack
                    );
                } else if (!isDamaged && this.stateDict.isEnraged) {
                    this.baseStateDict.isEnraged = false;
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
        param.attack += 3;
    }
} 