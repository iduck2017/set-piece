import { Def, Lifecycle, Props, Validator } from "@/set-piece";
import { FeatureDef, FeatureModel } from "./feature";
import { TargetCollector } from "../types/collector";
import { CardModel } from "./card";

export type BattlecryDef<
    T extends Def = Def
> = FeatureDef<T>;

export abstract class BattlecryModel<
    T extends BattlecryDef = BattlecryDef
> extends FeatureModel<T> {
    static battlecryProps<T extends BattlecryDef>(props: Props<T>) {
        return FeatureModel.featureProps(props);
    }

    protected abstract handleBattlecry(
        target: CardModel,
        targetCollectorList: TargetCollector[]
    ): void;


    @Lifecycle.useLoader()
    @Validator.useCondition(model => Boolean(model.referDict.board))
    private _listenBattlecry() {
        const minion = this.referDict.minion;
        if (!minion) return;
        this.bindEvent(
            minion.eventEmitterDict.onBattlecry,
            this.handleBattlecry
        );
    }

    protected abstract handleCollectorCheck(
        targetCollectorList: TargetCollector[]
    ): void;

    @Lifecycle.useLoader()
    @Validator.useCondition(model => Boolean(model.referDict.hand))
    private _listenCollectorCheck() {
        const card = this.referDict.card;
        if (!card) return;
        this.bindEvent(
            card.eventEmitterDict.onCollectorCheck,
            this.handleCollectorCheck
        );
    }
}
