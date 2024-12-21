import { Def, LifecycleService, Props, ValidatorService } from "@/set-piece";
import { FeatureDef, FeatureModel } from "./feature";
import { CombativeModel } from "./combative";
import { MinionModel } from "./minion";

export type OngoingEffectDef<
    T extends Partial<Def> = Def
> = FeatureDef<{
    code: `${string}-ongoing-effect-feature`;
} & T>;

export abstract class OngoingEffectModel<
    T extends OngoingEffectDef = OngoingEffectDef
> extends FeatureModel<T> {
    static ongoingEffectProps<T extends OngoingEffectDef>(props: Props<T>) {
        return FeatureModel.featureProps(props);
    }

    protected abstract handleOngoingEffect(
        minion: MinionModel
    ): void;

    protected abstract disposeOngoingEffect(
        minion: MinionModel
    ): void;

    @LifecycleService.useLoader()
    @ValidatorService.useCondition(model => Boolean(model.referDict.board))
    private _listenMinionDie() {
        const game = this.referDict.game;
        if (!game) return;
        this.bindEvent(
            game.eventEmitterDict.onMinionDispose,
            this.disposeOngoingEffect
        );
    }

    @LifecycleService.useLoader()
    @ValidatorService.useCondition(model => Boolean(model.referDict.board))
    private _listenMinionSummon() {
        const game = this.referDict.game;
        if (!game) return;
        this.unbindEvent(
            game.eventEmitterDict.onMinionSummon,
            this.handleOngoingEffect
        );
    }
}
