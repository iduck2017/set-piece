import { 
    CustomDef,
    Def,
    FactoryService,
    Model,
    NodeModel,
    Props,
    StrictProps
} from "@/set-piece";
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
    T extends Partial<Def> = Def
> = CustomDef<{
    code: `${string}-feature`,
    stateDict: {
    },
    paramDict: {
        readonly name: string;
        readonly desc: string;
    }
    childList: [],
    eventDict: {},
    parent: PlayerModel | CardModel | FeatureListModel
} & T>;

@FactoryService.useProduct('feature-list')
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
    
    accessFeature<M extends FeatureModel>(code: Model.Code<M>): void;
    accessFeature<M extends FeatureModel>(chunk: Model.Chunk<M>): void;
    accessFeature<M extends FeatureModel>(chunk: Model.Chunk<M> | Model.Code<M>) {
        if (typeof chunk === 'string') chunk = { code: chunk };
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

    get referDict(): Partial<{
        game: GameModel;
        player: PlayerModel;
        board: BoardModel;
        hand: HandModel;
        deck: DeckModel;
        graveyard: GraveyardModel;
        minion: MinionModel;
        card: CardModel;
    }> {
        return {
            game: this.queryParent('game', true),
            player: this.queryParent('player', true),
            board: this.queryParent('board', true),
            hand: this.queryParent('hand', true),
            deck: this.queryParent('deck', true),
            graveyard: this.queryParent('graveyard', true),
            minion: this.queryParent('minion-card', true),
            card: this.queryParent('card', true)
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