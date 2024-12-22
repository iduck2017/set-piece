import { FactoryService } from "@/set-piece/services/factory";
import { Props } from "@/set-piece/types/props";
import { FeatureDef } from "@/hearthstone/models/feature";
import { MinionDef, MinionModel } from "@/hearthstone/models/minion";
import { OngoingEffectModel } from "@/hearthstone/models/ongoing-effect";
import { Mutator } from "@/set-piece/utils/mutator";
import { CombativeModel } from "@/hearthstone/models/combative";
import { Model } from "@/set-piece";
import { RaceType } from "@/hearthstone/services/database";

export type FeatureGrimscaleOracleDef = FeatureDef<{
    code: 'grimscale-oracle-ongoing-effect-feature',
}>

@FactoryService.useProduct('grimscale-oracle-ongoing-effect-feature')
export class GrimscaleOracleFeatureModel extends OngoingEffectModel<FeatureGrimscaleOracleDef> {
    constructor(props: Props<FeatureGrimscaleOracleDef>) {
        super({
            ...props,
            paramDict: {
                name: 'Grimscale Oracle Aura',
                desc: 'ALL other Murlocs have +1 Attack.'
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
            requiredRaces: [RaceType.Murloc]
        });
        return result;
    }

}