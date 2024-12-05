import { Factory } from "@/service/factory";
import { IModel, Model } from "@/model";
import { ChunkOf } from "@/type/model";
import { Deck } from "./deck";
import { Hand } from "./hand";
import { Team } from "./team";
import { Tomb } from "./tomb";

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
    {}
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

    draw() {
        const chunk = this.child.deck.shift();
        if (chunk) {
            this.child.hand.append(chunk);
        }
    }
}
