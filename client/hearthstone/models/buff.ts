import { Def, LifecycleService, Model, Props, ValidatorService } from "@/set-piece";
import { CombativeModel } from "./combative";
import { Mutable } from "utility-types";
import { FeatureDef, FeatureModel } from "./feature";

export type BuffDef<
    T extends Partial<Def> = Def
> = FeatureDef<{
    code: `${string}-buff-feature`;
    paramDict: {
        modAttack?: number;
        modHealth?: number;
        isFixed?: boolean;
        isDisposedOnTurnEnd?: boolean;
    }
} & T>;


export abstract class BuffModel<
    T extends BuffDef = BuffDef
> extends FeatureModel<T> {
    static buffProps<T extends BuffDef>(props: Props<T>) {
        return FeatureModel.featureProps(props);
    }

    @LifecycleService.useLoader()
    @ValidatorService.useCondition(model => Boolean(model.referDict.board))
    private _listenParamCheck() {
        const minion = this.referDict.minion;
        const combative = minion?.childDict.combative;
        if (!combative) return;
        this.bindEvent(
            combative.eventEmitterDict.onParamCheck,
            this._buff
        );
    }

    private _buff(
        target: CombativeModel, 
        param: Mutable<Model.ParamDict<CombativeModel>>
    ) {
        console.log('[execute-buff]', param, this, this.stateDict);
        if (this.stateDict.isFixed) {
            if (this.stateDict.modAttack !== undefined) {
                param.attack = this.stateDict.modAttack;
            }
            if (this.stateDict.modHealth !== undefined) {
                param.maxHealth = this.stateDict.modHealth;
            }
        } else {
            if (this.stateDict.modAttack !== undefined) {
                param.attack += this.stateDict.modAttack;
            }
            if (this.stateDict.modHealth !== undefined) {
                param.maxHealth += this.stateDict.modHealth;
            }
        }
    }

    @LifecycleService.useLoader()
    @ValidatorService.useCondition(model => Boolean(model.referDict.minion))
    private _listenTurnEnd() {
        if (!this.stateDict.isDisposedOnTurnEnd) return;
        const minion = this.referDict.minion;
        const combative = minion?.childDict.combative;
        const game = this.referDict.game;
        if (!combative || !game) return;
        this.bindEvent(
            game.eventEmitterDict.onTurnEnd,
            () => {
                this.unbindEvent(
                    combative.eventEmitterDict.onParamCheck,
                    this._buff
                );
            }
        );
    }
}
