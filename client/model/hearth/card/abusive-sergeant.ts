import { Def } from "@/type/define";
import { CardDef, CardModel, TargetCollector } from ".";
import { Props } from "@/type/props";
import { MinionDef, MinionModel } from "./minion";
import { FeatureModel, FeatureDef } from "..";

import { Factory } from "@/service/factory";
import { Lifecycle } from "@/service/lifecycle";
import { CombatableModel } from "../combatable";
import { Model } from "@/type/model";
import { Mutable } from "utility-types";
import { GameModel } from "../game";
import { BoardModel } from "../board";

/**
 * @propmt
 * Abusive Sergeant  Battlecry: Give a minion +2 Attack this turn
 * use GameModel event onRoundEnd 
 */ 
export type AbusiveSergeantDef = Def.Create<{
    code: 'abusive-sergeant',
    childDict: {
        battlecry: BattlecryAbusiveSergeantModel
    }
}>


@MinionModel.useRule({
    manaCost: 1,
    health: 1,
    attack: 2,
    races: []
})
@Factory.useProduct('abusive-sergeant')
export class AbusiveSergeantModel extends MinionModel<AbusiveSergeantDef> {
    constructor(props: Props<AbusiveSergeantDef & CardDef & MinionDef>) {
        const superProps = MinionModel.minionProps(props);
        super({
            ...superProps,
            stateDict: {},
            paramDict: {
                races: [],
                name: 'Abusive Sergeant',
                desc: 'Battlecry: Give a minion +2 Attack this turn.'
            },
            childDict: {
                battlecry: { code: 'battlecry-abusive-sergeant' },
                ...superProps.childDict
            }
        });
    }

    debug() {
        super.debug();
        this.childDict.battlecry.debug();
    }
}

export type BattlecryAbusiveSergeantDef = Def.Create<{
    code: 'battlecry-abusive-sergeant',
    parent: AbusiveSergeantModel
}>

@Factory.useProduct('battlecry-abusive-sergeant')
export class BattlecryAbusiveSergeantModel extends FeatureModel<BattlecryAbusiveSergeantDef> {
    constructor(props: Props<BattlecryAbusiveSergeantDef & FeatureDef>) {
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

    @Lifecycle.useLoader()
    private _handleBattlecry() {
        if (this.card instanceof MinionModel) {
            const card: MinionModel<Def.Pure> = this.card;
            this.bindEvent(
                card.eventEmitterDict.onBattlecry,
                (target, targetCollectorList) => {
                    // if (target?.childDict.combatable) {
                    //     const combatable = target.childDict.combatable;
                    //     const game = this.card.game;
                        
                    //     // 增加攻击力
                    //     const oldAttack = combatable.stateDict.attack;
                    //     combatable.baseStateDict.attack += 2;

                    //     // 在回合结束时恢复
                    //     this.bindEvent(
                    //         game.eventEmitterDict.onRoundEnd,
                    //         () => {
                    //             combatable.baseStateDict.attack = oldAttack;
                    //         },
                    //         true // 只触发一次
                    //     );
                    // }
                    const targetCollector = targetCollectorList.find(
                        item => item.uuid === this.uuid
                    );
                    if (targetCollector?.result instanceof MinionModel) {
                        const card: MinionModel<Def.Pure> = targetCollector.result;
                        const combatable = card.childDict.combatable;
                        this.bindEvent(
                            combatable.eventEmitterDict.onParamCheck,
                            this._handleBuff
                        );
                        this.bindEvent(
                            GameModel.core.eventEmitterDict.onRoundEnd,
                            () => {
                                console.log('[buff-timeout]', card.code);
                                this.unbindEvent(
                                    combatable.eventEmitterDict.onParamCheck,
                                    this._handleBuff
                                );
                            }
                        );
                    }
                }
            );
        }
    }

    @Lifecycle.useLoader()
    private _handleTargetCheck() {
        this.bindEvent(
            this.card.eventEmitterDict.onTargetCheck,
            (targetCollectorList: TargetCollector[]) => {
                const length =
                    this.card.opponent.childDict.board.childList.length +
                    this.card.player.childDict.board.childList.length;
                console.log('[minion-number]', length);
                if (length) {
                    targetCollectorList.push({
                        uuid: this.uuid,
                        hint: 'Choose a minion.',
                        validator: (target) => {
                            // Any other minion on the board
                            const result = target instanceof CardModel &&
                                target.parent instanceof BoardModel &&
                                target !== this.card;
                            return result;
                        }
                    });
                }
            }
        );
    }

    private _handleBuff(
        target: CombatableModel,
        param: Mutable<Model.ParamDict<CombatableModel>>
    ) {
        param.attack += 2;
    }
}
