import { CustomDef, Def, Factory, Model, NodeModel, Props, StrictProps } from "@/set-piece";
import { CardModel } from "./card";
import { GameModel } from "./game";
import { PlayerModel } from "./player";
import { BoardModel } from "./board";
import { HandModel } from "./hand";
import { DeckModel } from "./deck";
import { GraveyardModel } from "./graveyard";
import { MinionModel } from "./minion";

export type FeatureListDef = CustomDef<{
    code: 'feature-list',
    stateDict: {},
    paramDict: {},
    childList: FeatureModel[],
    eventDict: {
        onFeatureAccess: [FeatureModel];
    },
}>

export type FeatureDef<
    T extends Def = Def
> = CustomDef<{
    code: string,
    stateDict: {
    },
    paramDict: {
        readonly name: string;
        readonly desc: string;
    }
    childList: [],
    eventDict: {},
    parent: PlayerModel | CardModel | FeatureListModel
}> & T;

@Factory.useProduct('feature-list')
export class FeatureListModel extends NodeModel<FeatureListDef> {
    constructor(props: Props<FeatureListDef>) {
        super({
            childList: [],
            ...props,
            childDict: {},
            stateDict: {},
            paramDict: {}
        });
    } 
    
    accessFeature<M extends FeatureModel>(chunk: Model.Chunk<M>) {
        const target = this.appendChild(chunk);
        if (target) {
            this.eventDict.onFeatureAccess(target);
            return target;
        }
    }
}


export abstract class FeatureModel<
    T extends FeatureDef = FeatureDef
> extends NodeModel<T> {
    
    private get _minion() {
        return this.queryParent<MinionModel>(
            undefined,
            true,
            (model) => model instanceof MinionModel
        );
    }

    private get _card() {
        return this.queryParent<CardModel>(
            undefined,
            false,
            (model) => model instanceof CardModel
        );
    }

    get referDict() {
        return {
            game: this.queryParent<GameModel>('game', true),
            player: this.queryParent<PlayerModel>('player', true),
            board: this.queryParent<BoardModel>('board', true),
            hand: this.queryParent<HandModel>('hand', true),
            deck: this.queryParent<DeckModel>('deck', true),
            graveyard: this.queryParent<GraveyardModel>('graveyard', true),
            minion: this._minion,
            card: this._card
        };
    }

    static featureProps<T extends FeatureDef>(
        props: Props<T>
    ) {
        return props;
    }
    
    constructor(props: StrictProps<T>) {
        super(props);
    }
}