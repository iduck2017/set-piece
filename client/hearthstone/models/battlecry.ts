import { Def, LifecycleService, Props, ValidatorService } from "@/set-piece";
import { FeatureDef, FeatureModel } from "./feature";
import { TargetCollector } from "../types/collector";
import { CardModel } from "./card";

export type BattlecryDef<
    T extends Partial<Def> = Def
> = FeatureDef<{
    code: `${string}-battlecry-feature`;
} & T>;

export abstract class BattlecryModel<
    T extends BattlecryDef = BattlecryDef
> extends FeatureModel<T> {
    static battlecryProps<T extends BattlecryDef>(props: Props<T>) {
        return FeatureModel.featureProps(props);
    }

    protected abstract battlecry(
        target: CardModel,
        targetCollectorList: TargetCollector[]
    ): void;


    @LifecycleService.useLoader()
    @ValidatorService.useCondition(model => Boolean(model.referDict.board))
    private _listenBattlecry() {
        const minion = this.referDict.minion;
        if (!minion) return;
        this.bindEvent(
            minion.eventEmitterDict.onBattlecry,
            this.battlecry
        );
    }

    protected abstract handleCollectorInit(
        targetCollectorList: TargetCollector[]
    ): void;

    @LifecycleService.useLoader()
    @ValidatorService.useCondition(model => Boolean(model.referDict.hand))
    private _listenCollectorCheck() {
        const card = this.referDict.card;
        if (!card) return;
        this.bindEvent(
            card.eventEmitterDict.onCollectorInit,
            this.handleCollectorInit
        );
    }
}
