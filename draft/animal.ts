import { Def } from "@/type/define";
import { Model } from ".";
import { Edible, Petable } from "./feats";

export abstract class Animal<M extends Partial<Def>> extends Model<{
    tempState: {
        readonly name: string;
        readonly desc: string
    }
} & M> {}


@Petable.useRule({
    rawObedience: 80,
    rawIntelligence: 70
})
@Model.useProduct('dog')
export class Dog extends Animal<{
    type: 'dog';
    childDict: {
        petable: Petable,
        edible: Edible,
    }
}> {
    constructor(
        seq: Model.Seq<Dog>,
        parent: Model.Parent<Dog>
    ) {
        super({
            ...seq,
            childList: {},
            memoState: {
                ...seq.memoState
            },
            tempState: {
                name: 'Dog',
                desc: ''
            },
            childDict: {
                petable: { type: 'petable' },
                edible: { type: 'edible' },
                ...seq.childDict
            }
        }, parent);
    }
}

@Model.useProduct('chicken')
export class Chicken extends Animal<{
    type: 'chicken';
    childDict: {
        edible: Edible,
    }
}> {
    constructor(
        seq: Model.Seq<Chicken>,
        parent: Model.Parent<Chicken>
    ) {
        super({
            ...seq,
            childList: {},
            memoState: {
            },
            tempState: {
                name: 'Chicken',
                desc: ''
            },
            childDict: {
                edible: { type: 'edible' },
                ...seq.childDict
            }
        }, parent);
    }
}

@Petable.useRule({
    rawObedience: 30,
    rawIntelligence: 50
})
@Model.useProduct('cat')
export class Cat extends Animal<{       
    type: 'cat';
    childDict: {
        petable: Petable,
    }
}> {
    constructor(
        seq: Model.Seq<Cat>,
        parent: Model.Parent<Cat>
    ) {
        super({
            ...seq,
            childList: {},
            memoState: {
            },
            tempState: {
                name: 'Cat',
                desc: ''
            },
            childDict: {
                petable: { type: 'petable' },
                ...seq.childDict
            }
        }, parent);
    }
}

type Pet = Dog | Cat;
type Food = Chicken | Dog;

@Model.useProduct('human')
export class Human extends Animal<{
    type: 'human';
    childDict: {
    },
    childList: {
        pets: Pet[],
        food: Food[]
    }
}> {
    constructor(
        seq: Model.Seq<Human>,
        parent: Model.Parent<Human>
    ) {
        super({
            ...seq,
            childList: {
                pets: [],
                food: [],
                ...seq.childList
            },
            memoState: {
            },
            tempState: {
                name: 'Human',
                desc: ''
            },
            childDict: {
                ...seq.childDict
            }
        }, parent);
    }

    test() {
        this.child.pets[0].child.petable.play();
        this.child.food[0].child.edible.kill();
    }
}