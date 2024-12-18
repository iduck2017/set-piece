import { Def, Factory, Lifecycle, Props } from "@/set-piece";
import { FeatureDef, FeatureModel } from "../feature";
import { BigGameHunterModel } from "../minions/big-game-hunter";
import { TargetCollector } from "../card";
import { MinionModel } from "../minion";
import { validateTarget } from "@/hearthstone/utils/validator";

export type BattlecryBigGameHunterDef = FeatureDef<
    Def.Create<{
        code: 'battlecry-big-game-hunter',
        parent: BigGameHunterModel
    }>
>

@Factory.useProduct('battlecry-big-game-hunter')
export class BattlecryBigGameHunterModel extends FeatureModel<BattlecryBigGameHunterDef> {
    constructor(props: Props<BattlecryBigGameHunterDef>) {
        super({
            ...props,
            paramDict: {
                name: 'Big Game Hunter\'s Battlecry',
                desc: 'Destroy a minion with 7 or more Attack.'
            },
            stateDict: {},
            childDict: {}
        });
    }

    @Lifecycle.useLoader()
    private _handleBattlecry() {
        const minion = this.refer.minion;
        const combatable = this.refer.minionCombatable;
        if (!minion || !combatable) return;

        this.bindEvent(
            minion.eventEmitterDict.onBattlecry,
            (target, targetCollectorList) => {
                const targetCollector:
                    TargetCollector<MinionModel> | undefined =
                    targetCollectorList.find(
                        item => item.uuid === this.uuid
                    );
                if (targetCollector?.result) {
                    targetCollector.result.childDict.combatable.destroy();
                }
            }
        );
    }

    @Lifecycle.useLoader()
    private _handleTargetCheck() {
        const card = this.refer.card;
        if (!card) return;

        this.bindEvent(
            card.eventEmitterDict.onTargetCheck,
            (targetCollectorList: TargetCollector[]) => {
                const minionList = this.refer.queryMinionList({});
                if (minionList.length) {
                    targetCollectorList.push({
                        uuid: this.uuid,
                        hint: 'Choose a minion with 7 or more Attack',
                        validator: (model) => validateTarget(
                            model,
                            { 
                                isMinionOnBoard: true
                            },
                            (model: MinionModel) => (
                                model instanceof MinionModel &&
                                model.childDict.combatable.stateDict.attack >= 7
                            )
                        )
                    });
                }
            }
        );
    }
} 