import { Def, LifecycleService, Props, ValidatorService } from "@/set-piece";
import { FeatureDef, FeatureModel } from "./feature";
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

    protected abstract registerOngoingEffect(
        minion: MinionModel
    ): void;

    protected abstract disposeOngoingEffect(
        minion: MinionModel
    ): void;

    protected abstract getTargetList(): MinionModel[]

    private _handleMinionSummon(minion: MinionModel) {
        const targetList = this.getTargetList();
        if (targetList.includes(minion)) {
            this.registerOngoingEffect(minion);
        }
    }

    private _handleMinionDie(minion: MinionModel) {
        console.log('[handle-minion-die]', minion);
        const targetList = this.getTargetList();
        if (targetList.includes(minion)) {
            this.disposeOngoingEffect(minion);
        }
    }

    @LifecycleService.useLoader()
    @ValidatorService.useCondition(model => Boolean(model.referDict.board))
    private _listenMinionDie() {
        const game = this.referDict.game;
        if (!game) return;
        this.bindEvent(
            game.eventEmitterDict.onMinionDispose,
            this._handleMinionDie
        );
    }

    @LifecycleService.useLoader()
    @ValidatorService.useCondition(model => Boolean(model.referDict.board))
    private _listenMinionSummon() {
        const game = this.referDict.game;
        const targetList = this.getTargetList();
        for (const target of targetList) {
            this.registerOngoingEffect(target);
        }
        if (!game) return;
        this.bindEvent(
            game.eventEmitterDict.onMinionSummon,
            this._handleMinionSummon
        );
    }

    @LifecycleService.useLoader()
    @ValidatorService.useCondition(model => Boolean(model.referDict.board))
    private _handleLoad() {
        console.log('[load-buff]', this.uuid, this.parent.uuid);
    }
    
    @LifecycleService.useUnloader()
    @ValidatorService.useCondition(model => Boolean(model.referDict.board))
    private _handleUnload() {
        console.log('[unload-buff]', this.uuid);
    }
}
