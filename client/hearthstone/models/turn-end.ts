import { LifecycleService, ValidatorService, Props, Def } from "@/set-piece";
import { FeatureDef, FeatureModel } from "./feature";

export type TurnEndDef<
    T extends Partial<Def> = Def
> = FeatureDef<{
    code: `${string}-turn-end-feature`,
} & T>

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
