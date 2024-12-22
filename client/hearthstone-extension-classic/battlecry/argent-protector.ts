import { FactoryService, Props } from "@/set-piece";
import { BattlecryModel } from "@/hearthstone/models/battlecry";
import { FeatureDef } from "@/hearthstone/models/feature";
import { TargetCollector } from "@/hearthstone/types/collector";
import { CardModel } from "@/hearthstone/models/card";
import { MinionModel } from "@/hearthstone/models/minion";

export type BattlecryArgentProtectorDef = FeatureDef<{
    code: 'argent-protector-battlecry-feature',
}>

@FactoryService.useProduct('argent-protector-battlecry-feature')
export class ArgentProtectorBattlecryModel extends BattlecryModel<BattlecryArgentProtectorDef> {
    constructor(props: Props<BattlecryArgentProtectorDef>) {
        super({
            ...props,
            paramDict: {
                name: 'Argent Protector\'s Battlecry',
                desc: 'Give a friendly minion Divine Shield.'
            },
            stateDict: {},
            childDict: {}
        });
    }

    protected override battlecry(
        target: CardModel,
        targetCollectorList: TargetCollector[]
    ): void {
        const targetCollector: 
            TargetCollector<MinionModel> | undefined = 
            targetCollectorList.find(
                item => item.uuid === this.uuid
            );
        const result = targetCollector?.result;
        const divineShield = result?.childDict.divineShield;
        console.log('[battlecry]', divineShield);
        if (!divineShield) return;
        divineShield.getDevineShield();
    }

    protected override handleCollectorInit(
        targetCollectorList: TargetCollector[]
    ) {
        const game = this.referDict.game;
        if (!game) return;
        const candidateList = game.queryTargetList({
            excludePlayer: true,
            excludeTarget: this.referDict.card,
            excludePosition: game.getOpponent(this.referDict.player)
        });
        if (!candidateList.length) return;
        targetCollectorList.push({
            uuid: this.uuid,
            hint: 'Choose a friendly minion to give Divine Shield.',
            candidateList,
        });
    }
} 