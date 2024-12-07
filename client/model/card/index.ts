import { IModel, Model } from "@/model";
import { Dict, Value } from "@/type/base";
import { IMinion } from "../minion";
import { Player } from "../player";
import { Hand } from "../hand";
import { Deck } from "../deck";
import { Team } from "../team";
import { Tomb } from "../tomb";
import { Game } from "../game";
import { Feats, IFeat } from "../feat";
import { BattlecryDrawCard } from "../feat/battlecry-draw-card";

// export type Minion<
//     T extends string = string,
//     S extends Dict<Value> = Dict<never>,
//     C extends Dict<Model> = Dict<never>,
//     E extends Dict = Dict<never>
// > = ICard<T, S, C & {
//     minion: IMinion
// }, E>

export type Card<
    T extends string = string,
    S extends Dict<Value> = Dict,
    C extends Dict<Model> = Dict,
    E extends Dict = Dict
> = ICard<T, S, C, E>

export abstract class ICard<
    T extends string = string,
    S extends Dict<Value> = Dict<never>,
    C extends Dict<Model> = Dict<never>,
    E extends Dict = Dict<never>
> extends IModel<
    T,
    S & {
        readonly name: string;
        readonly desc: string;
    },
    C & {
        minion?: IMinion
        baseFeats: Feats<IFeat, ICard>
        tempFeats: Feats<IFeat, ICard>
    },
    E
> {
    declare parent: Hand | Deck | Team | Tomb;

    get opponent(): Player {
        const player = this.player;
        const redPlayer = Game.main.child.redPlayer;
        const bluePlayer = Game.main.child.bluePlayer;
        return player === redPlayer? bluePlayer : redPlayer;
    }

    get player(): Player {
        return this.parent.parent;
    }
}
