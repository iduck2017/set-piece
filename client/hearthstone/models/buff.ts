import { Def, Lifecycle, Model, Props } from "@/set-piece";
import { CombatableModel } from "./combatable";
import { Mutable } from "utility-types";
import { FeatureDef, FeatureModel } from "./feature";

export type BuffDef<
    T extends Def = Def
> = FeatureDef<
    Def.Create<{
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
    private _handleBuff() {
        const combatable = this.refer.combatable;
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
    private _handleRoundEnd() {
        const combatable = this.refer.combatable;
        const game = this.refer.game;
        if (!combatable || !game) return;
        if (this.stateDict.shouldDisposedOnRoundEnd) {
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
}
