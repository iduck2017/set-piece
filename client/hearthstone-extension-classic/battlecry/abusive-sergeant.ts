import { CustomDef, Def, FactoryService, LifecycleService, Props } from "@/set-piece";
import { BattlecryModel } from "@/hearthstone/models/battlecry";
import { FeatureDef } from "@/hearthstone/models/feature";
import { TargetCollector } from "@/hearthstone/types/collector";
import { CardModel } from "@/hearthstone/models/card";
import { BuffAbusiveSergeantModel } from "../buffs/abusive-sergeant";

export type BattlecryAbusiveSergeantDef = FeatureDef<
    CustomDef<{
        code: 'abusive-sergeant-battlecry-feature',
    }>
>

@FactoryService.useProduct('abusive-sergeant-battlecry-feature')
export class BattlecryAbusiveSergeantModel extends BattlecryModel<BattlecryAbusiveSergeantDef> {
    constructor(props: Props<BattlecryAbusiveSergeantDef>) {
        super({
            ...props,
            paramDict: {
                name: 'Abusive Sergeant\'s Battlecry',
                desc: 'Give a minion +2 Attack this turn.'
            },
            stateDict: {},
            childDict: {}
        });
    }

    protected handleBattlecry(
        target: CardModel,
        targetCollectorList: TargetCollector[]
    ): void {
        const targetCollector:
            TargetCollector<CardModel> | undefined = 
            targetCollectorList.find(
                item => item.uuid === this.uuid
            );
        const result = targetCollector?.result;
        if (!result) return;
        result.childDict.featureList.accessFeature<
            BuffAbusiveSergeantModel
        >('abusive-sergeant-buff-feature');
    }

    protected handleCollectorCheck(
        targetCollectorList: TargetCollector[]
    ) {
        const game = this.referDict.game;
        if (!game) return;
        const candidateList = game.queryTargetList({
            excludePlayer: true,
            excludeTarget: this.referDict.card
        });
        if (!candidateList.length) return;
        targetCollectorList.push({
            uuid: this.uuid,
            hint: 'Choose a minion.',
            candidateList,
        });
    }
}