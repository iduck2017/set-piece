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
    ValidatorService 
} from "@/set-piece";
import { PlayerModel } from "./player";
import { GameModel } from "./game";
import { DeckModel } from "./deck";
import { HandModel } from "./hand";
import { GraveyardModel } from "./graveyard";
import { TargetCollector, TargetCollectorInfo } from "../types/collector";
import { ClassNameType, ExpansionType, RarityType } from "../services/database";

export enum CardType {
    Minion = 'minion',
    Spell = 'spell',
    Weapon = 'weapon',
    Hero = 'hero',
}

export type CardRule = {
    type: CardType,
    className: ClassNameType,
    rarity: RarityType,
    expansion: ExpansionType
    isDerived?: boolean
}

export type CardDef<
    T extends Partial<Def> = Def
> = CustomDef<{
    code: `${string}-card`;
    stateDict: {
    },
    paramDict: {
        readonly name: string;
        readonly desc: string;
        readonly flavor: string;
    }
    eventDict: {
        onCollectorInit: [TargetCollector[]] 
    },
    childDict: {
        castable: CastableModel,
        featureList: FeatureListModel,
    },
    parent: BoardModel | DeckModel | HandModel | GraveyardModel
} & T>


export abstract class CardModel<
    T extends CardDef = CardDef
> extends NodeModel<T> {
    _cardEventDict: Readonly<Event.Dict<
        Def.EventDict<CardDef<PureDef>>
    >> = this.eventDict;
    
    public get referDict(): Partial<{
        board: BoardModel,
        deck: DeckModel,
        hand: HandModel,
        graveyard: GraveyardModel,
        player: PlayerModel,
        game: GameModel
    }> {
        return {
            board: this.queryParent('board', true),
            deck: this.queryParent('deck', true),
            hand: this.queryParent('hand', true),
            graveyard: this.queryParent('graveyard', true),
            player: this.queryParent('player', true),
            game: this.queryParent('game', true)
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

    @ValidatorService.useCondition(model => Boolean(model.referDict.hand))
    willPlay(): TargetCollectorInfo | undefined {
        const targetCollectorList: TargetCollector[] = [];
        this._cardEventDict.onCollectorInit(targetCollectorList);
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

    @ValidatorService.useCondition(model => Boolean(model.referDict.hand))
    play(collectorList: TargetCollector[]) {
        collectorList;
        const player = this.referDict.player;
        const hand = player?.childDict.hand;
        hand?.playCard(this);
    }

    @ValidatorService.useCondition(model => Boolean(model.referDict.deck))
    pick() {
        const player = this.referDict.player;
        if (!player) return;
        const deck = player.childDict.deck;
        deck.drawCard(this);
    }

    debug() {
        super.debug();
    }
}