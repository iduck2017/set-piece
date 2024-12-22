import { FactoryService, Props } from "@/set-piece";
import { BattlecryModel } from "@/hearthstone/models/battlecry";
import { FeatureDef } from "@/hearthstone/models/feature";
import { TargetCollector } from "@/hearthstone/types/collector";
import { CardModel } from "@/hearthstone/models/card";
import { MinionModel } from "@/hearthstone/models/minion";
import { RaceType } from "@/hearthstone/services/database";
import { HungryCrabBuffModel } from "../buffs/hungry-crab";

export type BattlecryHungryCrabDef = FeatureDef<{
    code: 'hungry-crab-battlecry-feature',
}>

@FactoryService.useProduct('hungry-crab-battlecry-feature')
export class HungryCrabBattlecryModel extends BattlecryModel<BattlecryHungryCrabDef> {
    constructor(props: Props<BattlecryHungryCrabDef>) {
        super({
            ...props,
            paramDict: {
                name: 'Hungry Crab\'s Battlecry',
                desc: 'Destroy a Murloc and gain +2/+2.'
            },
            stateDict: {},
            childDict: {}
        });
    }

    protected battlecry(
        target: CardModel,
        targetCollectorList: TargetCollector[]
    ): void {
        const targetCollector: 
            TargetCollector<MinionModel> | undefined = 
            targetCollectorList.find(
                item => item.uuid === this.uuid
            );

        const result = targetCollector?.result;
        if (!result) return;

        // Destroy target murloc
        const combative = result.childDict.combative;
        combative.destroy();
        
        // Add buff to self
        const card = this.referDict.card;
        if (!card) return;
        
        card.childDict.featureList.accessFeature<
            HungryCrabBuffModel
        >('hungry-crab-buff-feature');
    }

    protected handleCollectorInit(
        targetCollectorList: TargetCollector[]
    ) {
        const game = this.referDict.game;
        if (!game) return;
        // Only target Murlocs
        const candidateList = game.queryTargetList({
            excludePlayer: true,
            requiredRaces: [RaceType.Murloc]
        })
        if (!candidateList.length) return;
        targetCollectorList.push({
            uuid: this.uuid,
            hint: 'Choose a Murloc to destroy.',
            candidateList,
        });
    }
} 