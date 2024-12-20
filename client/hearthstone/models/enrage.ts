import { CustomDef, Def, Lifecycle, Model, Props, Validator } from "@/set-piece";
import { FeatureDef, FeatureModel } from "./feature";
import { CombatableModel } from "./combatable";
import { Mutable } from "utility-types";

export type EnrageDef<
    T extends Def = Def
> = FeatureDef<
    CustomDef<{
        code: string;
        stateDict: {
            isEnraged: boolean;
        }
    }>
> & T;

export abstract class EnrageModel<
    T extends EnrageDef = EnrageDef
> extends FeatureModel<T> {
    static enrageProps<T extends EnrageDef>(props: Props<T>) {
        return FeatureModel.featureProps(props);
    }

    protected abstract handleEnrage(
        target: CombatableModel,
        param: Mutable<Model.ParamDict<CombatableModel>>
    ): void;

    @Lifecycle.useLoader()
    @Validator.useCondition(model => Boolean(model.referDict.board))
    private _listenEnrage() {
        const minion = this.referDict.minion;
        const combatable = minion?.childDict.combatable;
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
                        this.handleEnrage
                    );
                } else if (!isDamaged && this.stateDict.isEnraged) {
                    this.baseStateDict.isEnraged = false;
                    this.unbindEvent(
                        combatable.eventEmitterDict.onParamCheck,
                        this.handleEnrage
                    );
                }
            }
        );
    }
}
