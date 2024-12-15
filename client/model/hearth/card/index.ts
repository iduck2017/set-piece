import { Def } from "@/type/define";
import { NodeModel } from "../../node";
import { Props } from "@/type/props";
import { CastableModel } from "../castable";
import { FeatureListModel } from "..";
import { CombatableModel } from "../combatable";
import { Validator } from "@/service/validator";
import { HandModel } from "../hand";
import { GraveyardModel } from "../graveyard";
import { DeckModel } from "../deck";
import { BoardModel } from "../board";
import { PlayerModel } from "../player";
import { Chunk } from "@/type/chunk";
import { Dict } from "@/type/base";
import { Event } from "@/type/event";
import { Model } from "@/type/model";

export type TargetCollector = {
    hint: string;
    uuid: string;
    result?: Model;
    validator: (
        target: Model, 
        list: TargetCollector[]
    ) => boolean;
}

export type TargetCollectorInfo = {
    list: TargetCollector[];
    index: number;
    runner: (list: TargetCollector[]) => void;
}

export type CardDef = Def.Create<{
    code: string;
    stateDict: {
    },
    paramDict: {
        readonly name: string;
        readonly desc: string;
    }
    eventDict: {
        onTargetCheck: [TargetCollector[]] 
    },
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
    _cardEventDict: Readonly<Event.Dict<Def.EventDict<CardDef>>> = this.eventDict;

    static cardProps<T>(props: Props<T & CardDef>) {
        const childDict: Dict.Strict<Chunk.Dict<Def.ChildDict<CardDef>>> = {
            featureList: { code: 'feature-list' },
            ...props.childDict
        };
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
    prepare(): TargetCollectorInfo | undefined {
        const targetCollectorList: TargetCollector[] = [];
        this._cardEventDict.onTargetCheck(targetCollectorList);
        console.log('[target collector list]', targetCollectorList);
        if (!targetCollectorList.length) {
            this.play([]);
            return undefined;
        }
        return {
            list: targetCollectorList,
            index: 0,
            runner: this.play.bind(this)
        };
    }

    @Validator.useCondition(model => model.parent instanceof HandModel)
    play(collectorList: TargetCollector[]) {
        if (this.parent instanceof HandModel) {
            this.parent.removeCard(this);
        }
    }
}