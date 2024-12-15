import { Def } from "@/type/define";
import { CardDef } from ".";
import { Props } from "@/type/props";
import { MinionDef, MinionModel } from "./minion";
import { FeatureModel, FeatureDef } from "..";
import { Factory } from "@/service/factory";
import { DataBase, RaceType } from "@/service/database";
import { Lifecycle } from "@/service/lifecycle";
import { GameModel } from "../game";
import { Random } from "@/util/random";

/**
 * @prompt
 * Blood Imp  1/0/1  At the end of your turn, give another random friendly minion +1 Health.
 */

export type BloodImpDef = Def.Create<{
    code: 'blood-imp',
    childDict: {
        effectBloodImp: EffectBloodImpModel
    }
}>

@DataBase.useCard({
})
@MinionModel.useRule({
    manaCost: 1,
    health: 1,
    attack: 0,
    races: [ RaceType.Demon ]
})
@Factory.useProduct('blood-imp')
export class BloodImpModel extends MinionModel<BloodImpDef> {
    constructor(props: Props<BloodImpDef & CardDef & MinionDef>) {
        const superProps = MinionModel.minionProps(props);
        super({
            ...superProps,
            stateDict: {},
            paramDict: {
                races: [ RaceType.Demon ],
                name: 'Blood Imp',
                desc: 'At the end of your turn, give another random friendly minion +1 Health.'
            },
            childDict: {
                effectBloodImp: { code: 'effect-blood-imp' },
                ...superProps.childDict
            }
        });
    }
}

export type EffectBloodImpDef = Def.Create<{
    code: 'effect-blood-imp',
    parent: BloodImpModel
}>

@Factory.useProduct('effect-blood-imp')
export class EffectBloodImpModel extends FeatureModel<EffectBloodImpDef> {
    constructor(props: Props<EffectBloodImpDef & FeatureDef>) {
        super({
            ...props,
            paramDict: {
                name: 'Blood Imp\'s End Turn Effect',
                desc: 'Give another random friendly minion +1 Health.'
            },
            stateDict: {},
            childDict: {}
        });
    }

    @Lifecycle.useLoader()
    private _handleEndTurn() {
        if (this.card instanceof MinionModel) {
            const card: MinionModel<Def.Pure> = this.card;
            this.bindEvent(
                GameModel.core.eventEmitterDict.onRoundEnd,
                () => {
                    // 只在自己的回合结束时触发
                    // if (card.player === card.game.currentPlayer) {
                    const minionAllyList = card.player.childDict.board.childList
                        .filter(minion => minion !== this.card); // 排除自己
                    if (minionAllyList.length > 0) {
                        // 随机选择一个友方随从
                        // const randomIndex = Math.floor(Math.random() * allyList.length);
                        const index = Random.number(0, minionAllyList.length - 1);
                        const target = minionAllyList[index];
                        if (target instanceof MinionModel) {
                            const card: MinionModel<Def.Pure> = target;
                            const combatable = card.childDict.combatable;
                            this.bindEvent(
                                combatable.eventEmitterDict.onParamCheck,
                                (target, param) => {
                                    param.maxHealth += 1;
                                }
                            );
                        }
                    }
                    // }
                }
            );
        }
    }
} 