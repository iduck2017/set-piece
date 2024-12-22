import { FactoryService, LifecycleService, Props, ValidatorService } from "@/set-piece";
import { FeatureDef, FeatureModel } from "@/hearthstone/models/feature";
import { MinionDef, MinionModel } from "@/hearthstone/models/minion";
import { RaceType } from "@/hearthstone/services/database";
import { CombativeModel } from "@/hearthstone/models/combative";
import { Model } from "@/set-piece";
import { Mutator } from "@/set-piece/utils/mutator";
import { OngoingEffectDef, OngoingEffectModel } from "@/hearthstone/models/ongoing-effect";

export type FeatureTimberWolfDef = OngoingEffectDef<{
    code: 'timber-wolf-ongoing-effect-feature',
}>

@FactoryService.useProduct('timber-wolf-ongoing-effect-feature')
export class TimberWolfFeatureModel extends OngoingEffectModel<FeatureTimberWolfDef> {
    constructor(props: Props<FeatureTimberWolfDef>) {
        super({
            ...props,
            paramDict: {
                name: 'Timber Wolf\'s Effect',
                desc: 'Your other Beasts have +1 Attack.'
            },
            stateDict: {},
            childDict: {}
        });
    }

    private _buff(
        target: CombativeModel,
        mutator: Mutator<Model.StateDict<CombativeModel>>
    ) {
        mutator.data.attack += 1;
    }

    protected override registerOngoingEffect(minion: MinionModel<MinionDef<{}>>): void {
        const game = this.referDict.game;
        const combative = minion.childDict.combative;
        if (!game) return;
        this.bindEvent(
            combative.eventEmitterDict.onStateCheck,
            this._buff
        )
    }

    protected override disposeOngoingEffect(minion: MinionModel<MinionDef<{}>>): void {
        const game = this.referDict.game;
        if (!game) return;
        const combative = minion.childDict.combative;
        this.unbindEvent(
            combative.eventEmitterDict.onStateCheck,
            this._buff
        )
    }

    protected override getTargetList(): MinionModel[] {
        const game = this.referDict.game;
        const player = this.referDict.player;
        const opponet = game?.getOpponent(player);
        if (!game) return [];
        const result = game.queryTargetList({
            excludePlayer: true,
            excludeTarget: this.referDict.card,
            excludePosition: opponet,
            requiredRaces: [RaceType.Beast]
        });
        return result;
    }
} 