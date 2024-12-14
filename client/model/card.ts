import { Def } from "@/type/define";
import { NodeModel } from "./node";
import { Props } from "@/type/props";
import { CastableModel } from "./castable";
import { FeatureListModel } from "./feature";
import { CombatableModel } from "./combatable";
import { Validator } from "@/service/validator";
import { HandModel } from "./hand";
import { GraveyardModel } from "./graveyard";
import { DeckModel } from "./deck";
import { BoardModel } from "./board";
import { PlayerModel } from "./player";

export type CardDef = Def.Merge<{
    code: string;
    stateDict: {
    },
    paramDict: {
        readonly name: string;
        readonly desc: string;
    }
    eventDict: {},
    childDict: {
        castable?: CastableModel,
        combatable?: CombatableModel
        featureList: FeatureListModel,
    }
    parent: HandModel | GraveyardModel | DeckModel | BoardModel
}>

export abstract class CardModel<
    T extends Def = Def
> extends NodeModel<T & CardDef> {
    static mergeProps(props: Props<CardDef>): Props.Strict<CardDef> {
        return {
            ...props,
            stateDict: {
            },
            paramDict: {
                name: 'Unknown Card',
                desc: 'Unknown Card'
            },
            childDict: {
                featureList: { code: 'feature-list' }
            }
        };
    }

    get opponent(): PlayerModel {
        const player = this.parent.parent;
        const game = player.parent;
        return game.childDict.redPlayer === player ?
            game.childDict.bluePlayer :
            game.childDict.redPlayer;
    }

    get player() {
        return this.parent.parent;
    }

    get stateDict() {
        return {
            ...super.stateDict,
            opponent: this.opponent,
            player: this.player
        };
    }
 
    @Validator.useCondition(model => model.parent instanceof HandModel)
    play() {
        if (this.parent instanceof HandModel) {
            this.parent.removeCard(this);
        }
    }
}