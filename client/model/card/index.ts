import { Def } from "@/type/define";
import { NodeModel } from "../node";
import { Props } from "@/type/props";
import { CastableModel } from "../castable";
import { FeatureListModel } from "../feature";
import { CombatableModel } from "../feature/combatable";
import { Validator } from "@/service/validator";
import { HandModel } from "../hand";
import { GraveyardModel } from "../graveyard";
import { DeckModel } from "../deck";
import { BoardModel } from "../board";
import { PlayerModel } from "../player";
import { Event } from "@/type/event";
import { Chunk } from "@/type/chunk";
import { Dict } from "@/type/base";

export type CardDef = Def.Create<{
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
    static cardProps<T>(props: Props<T & CardDef>) {
        const childDict: Dict.Strict<Chunk.Dict<Def.ChildDict<CardDef>>> = {
            featureList: { code: 'feature-list' },
            ...props.childDict
        }
        return {
            ...props,
            childDict
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

    // get stateDict() {
    //     return {
    //         ...super.stateDict,
    //         opponent: this.opponent,
    //         player: this.player
    //     };
    // }

    @Validator.useCondition(model => model.parent instanceof HandModel)
    play() {
        if (this.parent instanceof HandModel) {
            this.parent.removeCard(this);
        }
    }
}