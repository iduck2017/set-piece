import { Def } from "@/type/define";
import { CardDef, CardModel, TargetCollector } from ".";
import { Props } from "@/type/props";
import { MinionDef, MinionModel } from "./minion";
import { FeatureModel, FeatureDef } from "..";
import { Factory } from "@/service/factory";
import { BoardModel } from "../board";
import { CombatableModel } from "../combatable";
import { Lifecycle } from "@/service/lifecycle";

/**
 * @prompt
 * Elven Archer: 1/1/1 Battlecry: Deal 1 damage.
 */

export type ElvenArcherDef = Def.Create<{
    code: 'elven-archer',
    childDict: {
        battlecry: BattlecryElvenArcherModel
    }
}>


@MinionModel.useRule({
    manaCost: 1,
    health: 1,
    attack: 1,
    races: []
})
@Factory.useProduct('elven-archer')
export class ElvenArcherModel extends MinionModel<ElvenArcherDef> {
    constructor(props: Props<ElvenArcherDef & CardDef & MinionDef>) {
        const superProps = MinionModel.minionProps(props);
        super({
            ...superProps,
            stateDict: {},
            paramDict: {
                races: [],
                name: 'Elven Archer',
                desc: 'Battlecry: Deal 1 damage.'
            },
            childDict: {
                battlecry: { code: 'battlecry-elven-archer' },
                ...superProps.childDict
            }
        });
    }
}

export type BattlecryElvenArcherDef = Def.Create<{
    code: 'battlecry-elven-archer',
    parent: ElvenArcherModel
}>

@Factory.useProduct('battlecry-elven-archer')
export class BattlecryElvenArcherModel extends FeatureModel<BattlecryElvenArcherDef> {
    constructor(props: Props<BattlecryElvenArcherDef & FeatureDef>) {
        super({
            ...props,
            paramDict: {
                name: 'Elven Archer\'s Battlecry',
                desc: 'Deal 1 damage.'
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
                    const targetCollector = targetCollectorList.find(
                        item => item.uuid === this.uuid
                    );
                    if (targetCollector?.result instanceof MinionModel) {
                        const card: MinionModel<Def.Pure> = targetCollector.result;
                        const combatable = card.childDict.combatable;
                        if (combatable instanceof CombatableModel) {
                            combatable.receiveDamage(1, this.card);
                        }
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
                if (length) {
                    targetCollectorList.push({
                        uuid: this.uuid,
                        hint: 'Choose a target to deal 1 damage.',
                        validator: (target) => {
                            // Any character (minion or hero) on the board
                            return target instanceof CardModel &&
                                target.parent instanceof BoardModel &&
                                target !== this.card;
                        }
                    });
                }
            }
        );
    }
} 