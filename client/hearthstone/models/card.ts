import { BoardModel } from "./board";
import { CastableModel } from "./castable";
import { FeatureListModel } from "./feature";
import { 
    Chunk, 
    CustomDef, 
    Def, 
    Dict, 
    Event,  
    NodeModel, 
    Props, 
    PureDef, 
    Validator 
} from "@/set-piece";
import { PlayerModel } from "./player";
import { GameModel } from "./game";
import { DeckModel } from "./deck";
import { HandModel } from "./hand";
import { GraveyardModel } from "./graveyard";
import { TargetCollector, TargetCollectorInfo } from "../types/collector";

export enum CardType {
    Minion = 'minion',
    Spell = 'spell',
    Weapon = 'weapon',
    Hero = 'hero',
}

export type CardRule = {
    type: CardType,
}

export type CardDef<
    T extends Def = Def
> = CustomDef<{
    code: string;
    stateDict: {
    },
    paramDict: {
        readonly name: string;
        readonly desc: string;
        readonly flavor: string;
    }
    eventDict: {
        onCollectorCheck: [TargetCollector[]] 
    },
    childDict: {
        castable: CastableModel,
        featureList: FeatureListModel,
    },
    parent: BoardModel | DeckModel | HandModel | GraveyardModel
}> & T


export abstract class CardModel<
    T extends CardDef = CardDef
> extends NodeModel<T> {
    _cardEventDict: Readonly<Event.Dict<
        Def.EventDict<CardDef<PureDef>>
    >> = this.eventDict;
    
    public get referDict() {
        return {
            board: this.queryParent<BoardModel>('board', true),
            deck: this.queryParent<DeckModel>('deck', true),
            hand: this.queryParent<HandModel>('hand', true),
            graveyard: this.queryParent<GraveyardModel>('graveyard', true),
            player: this.queryParent<PlayerModel>('player', true),
            game: this.queryParent<GameModel>('game', true)
        };
    }

    static cardProps<T extends CardDef>(
        props: Props<T>
    ) {
        const childDict: Dict.Strict<Chunk.Dict<
            Def.ChildDict<CardDef<PureDef>>
        >> = {
            featureList: { code: 'feature-list' },
            castable: { code: 'castable' },
            ...props.childDict
        };
        return {
            ...props,
            childDict
        };
    }

    @Validator.useCondition(model => Boolean(model.referDict.hand))
    willPlay(): TargetCollectorInfo | undefined {
        const targetCollectorList: TargetCollector[] = [];
        this._cardEventDict.onCollectorCheck(targetCollectorList);
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

    @Validator.useCondition(model => Boolean(model.referDict.hand))
    play(collectorList: TargetCollector[]) {
        collectorList;
        const player = this.referDict.player;
        const hand = player?.childDict.hand;
        hand?.playCard(this);
    }

    @Validator.useCondition(model => Boolean(model.referDict.deck))
    pick() {
        const player = this.referDict.player;
        if (!player) return;
        const deck = player.childDict.deck;
        deck.drawCard(this);
    }

    debug() {
        super.debug();
        this.childDict.combatable?.debug();
    }
}