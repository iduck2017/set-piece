import { LifecycleService, ValidatorService, Props } from "@/set-piece";
import { FeatureDef, FeatureModel } from "./feature";

export type TurnEndDef = FeatureDef<{
    code: `${string}-turn-end-feature`,
}>

export abstract class TurnEndModel<
    T extends TurnEndDef = TurnEndDef
> extends FeatureModel<T> {
    static turnEndProps<T extends TurnEndDef>(props: Props<T>) {
        return FeatureModel.featureProps(props);
    }

    protected abstract handleTurnEnd(): void;

    @LifecycleService.useLoader()
    @ValidatorService.useCondition(model => Boolean(model.referDict.board))
    private _listenTurnEnd() {
        const game = this.referDict.game;
        if (!game) return;
        this.bindEvent(
            game.eventEmitterDict.onTurnEnd,
            this.handleTurnEnd
        );
    }
}
