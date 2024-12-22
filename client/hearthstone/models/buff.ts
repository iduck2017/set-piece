import { Def, LifecycleService, Model, Props, ValidatorService } from "@/set-piece";
import { CombativeModel } from "./combative";
import { FeatureDef, FeatureModel } from "./feature";
import { Mutator } from "@/set-piece/utils/mutator";

export type BuffDef<
    T extends Partial<Def> = Def
> = FeatureDef<{
    code: `${string}-buff-feature`;
    stateDict: {
        isActived: boolean;
    }
    paramDict: {
        readonly modAttack?: number;
        readonly modHealth?: number;
        readonly isReset?: boolean;
        readonly isTemperary?: boolean;
    }
} & T>;


export abstract class BuffModel<
    T extends BuffDef = BuffDef
> extends FeatureModel<T> {
    static buffProps<T extends BuffDef>(props: Props<T>) {
        const superProps = FeatureModel.featureProps(props);
        return {
            ...superProps,
            stateDict: {
                isActived: true,
                ...superProps.stateDict
            }
        };
    }

    @LifecycleService.useLoader()
    @ValidatorService.useCondition(model => Boolean(model.referDict.board))
    private _listenParamCheck() {
        const minion = this.referDict.minion;
        const combative = minion?.childDict.combative;
        if (!combative) return;
        this.bindEvent(
            combative.eventEmitterDict.onStateCheck,
            this._buff
        );
    }

    @ValidatorService.useCondition(model => model.stateDict.isActived)
    private _buff(
        target: CombativeModel, 
        param: Mutator<Model.ParamDict<CombativeModel>>
    ) {
        console.log('[execute-buff]', param, this, this.stateDict);
        if (this.stateDict.isReset) {
            if (this.stateDict.modAttack !== undefined) {
                param.data.attack = this.stateDict.modAttack;
            }
            if (this.stateDict.modHealth !== undefined) {
                param.data.maxHealth = this.stateDict.modHealth;
            }
        } else {
            if (this.stateDict.modAttack !== undefined) {
                param.data.attack += this.stateDict.modAttack;
            }
            if (this.stateDict.modHealth !== undefined) {
                param.data.maxHealth += this.stateDict.modHealth;
            }
        }
    }

    @LifecycleService.useLoader()
    @ValidatorService.useCondition(model => Boolean(model.referDict.board))
    private _listenTurnEnd() {
        if (!this.stateDict.isTemperary) return;
        const minion = this.referDict.minion;
        const combative = minion?.childDict.combative;
        const game = this.referDict.game;
        if (!combative || !game) return;
        this.bindEvent(
            game.eventEmitterDict.onTurnEnd,
            () => {
                this.baseStateDict.isActived = false;
                this.unbindEvent(
                    combative.eventEmitterDict.onStateCheck,
                    this._buff
                );
            }
        );
    }


}
