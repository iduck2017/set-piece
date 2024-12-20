import { CustomDef, Def, Lifecycle, Model, Props, Validator } from "@/set-piece";
import { CombatableModel } from "./combatable";
import { Mutable } from "utility-types";
import { FeatureDef, FeatureModel } from "./feature";

export type BuffDef<
    T extends Def = Def
> = FeatureDef<
    CustomDef<{
        code: string;
        stateDict: {
        },
        paramDict: {
            modAttack: number;
            modHealth: number;
            shouldDisposedOnRoundEnd?: boolean;
        }
    }>
> & T;


export abstract class BuffModel<
    T extends BuffDef = BuffDef
> extends FeatureModel<T> {
    static buffProps<T extends BuffDef>(props: Props<T>) {
        return FeatureModel.featureProps(props);
    }

    @Lifecycle.useLoader()
    @Validator.useCondition(model => Boolean(model.referDict.board))
    private _handleBuff() {
        const minion = this.referDict.minion;
        const combatable = minion?.childDict.combatable;
        if (!combatable) return;
        this.bindEvent(
            combatable.eventEmitterDict.onParamCheck,
            this._buff
        );
    }

    private _buff(
        target: CombatableModel, 
        param: Mutable<Model.ParamDict<CombatableModel>>
    ) {
        console.log('[execute-buff]', param, this, this.stateDict);
        param.attack += this.stateDict.modAttack;
        param.maxHealth += this.stateDict.modHealth;
    }

    @Lifecycle.useLoader()
    @Validator.useCondition(model => Boolean(model.referDict.minion))
    private _handleRoundEnd() {
        if (!this.stateDict.shouldDisposedOnRoundEnd) return;
        const minion = this.referDict.minion;
        const combatable = minion?.childDict.combatable;
        const game = this.referDict.game;
        if (!combatable || !game) return;
        console.log('[handle-round-end]', this);
        this.bindEvent(
            game.eventEmitterDict.onRoundEnd,
            () => {
                this.unbindEvent(
                    combatable.eventEmitterDict.onParamCheck,
                    this._buff
                );
            }
        );
    }
}
