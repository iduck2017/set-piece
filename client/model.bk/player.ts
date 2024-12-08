import { Factory } from "@/service/factory";
import { IModel, Model } from "@/model.bk";
import { ChunkOf } from "@/type/define";
import { Deck } from "./deck";
import { Hand } from "./hand";
import { Team } from "./team";
import { Tomb } from "./tomb";
import { Card } from "./card";

@Factory.useProduct('player')
export class Player extends IModel<
    'player',
    {
       readonly camp: string
    },
    {
        deck: Deck,
        hand: Hand,
        team: Team,
        tomb: Tomb
    },
    {
        onDraw: Card
    }
> {
    constructor(
        chunk: ChunkOf<Player>,
        parent: Model
    ) {
        super({
            ...chunk,
            child: {
                deck: { code: 'deck' },
                hand: { code: 'hand' },
                team: { code: 'team' },
                tomb: { code: 'tomb' },
                ...chunk.child
            },
            state: {
                camp: Factory.uuid,
                ...chunk.state
            }
        }, parent);
    }

    draw(count: number) {
        for (let index = 0; index < count; index += 1) {
            const chunk = this.child.deck.shift();
            if (chunk) {
                const card = this.child.hand.append(chunk);
                if (card) {
                    this._event.onDraw(card);
                }
            }
        }
    }
}
