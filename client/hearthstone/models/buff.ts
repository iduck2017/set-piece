import { CustomDef, Def, LifecycleService, Model, Props, ValidatorService } from "@/set-piece";
import { CombativeModel } from "./combative";
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

    @LifecycleService.useLoader()
    @ValidatorService.useCondition(model => Boolean(model.referDict.board))
    private _listenParamCheck() {
        const minion = this.referDict.minion;
        const combative = minion?.childDict.combative;
        if (!combative) return;
        this.bindEvent(
            combative.eventEmitterDict.onParamCheck,
            this._handleBuff
        );
    }

    private _handleBuff(
        target: CombativeModel, 
        param: Mutable<Model.ParamDict<CombativeModel>>
    ) {
        console.log('[execute-buff]', param, this, this.stateDict);
        param.attack += this.stateDict.modAttack;
        param.maxHealth += this.stateDict.modHealth;
    }

    @LifecycleService.useLoader()
    @ValidatorService.useCondition(model => Boolean(model.referDict.minion))
    private _listenRoundEnd() {
        if (!this.stateDict.shouldDisposedOnRoundEnd) return;
        const minion = this.referDict.minion;
        const combative = minion?.childDict.combative;
        const game = this.referDict.game;
        if (!combative || !game) return;
        console.log('[handle-round-end]', this);
        this.bindEvent(
            game.eventEmitterDict.onRoundEnd,
            () => {
                this.unbindEvent(
                    combative.eventEmitterDict.onParamCheck,
                    this._handleBuff
                );
            }
        );
    }
}
