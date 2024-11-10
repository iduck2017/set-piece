import { Random } from "@/util/random";
import { Model } from ".";

export enum Gender {
    Male = 'male',
    Female = 'female',
    Unknown = 'unknown'
}

@Model.useProduct('bunny')
export class Bunny extends Model<{
    type: 'bunny';
    state: {
        age: number;
        maxAge: number;
        gender: Gender;
        isAlive: boolean;
        warm: number;
        readonly matureAge: number;
    },
    tempState: {
    },
    initState: {
        readonly name: string
    },
    childDict: {
    }
    childList: {
        bunnies: Bunny[]
    },
    event: {
        reproduce: Bunny;
        die: Bunny;
    }
}> {
    static isAlive() {
        return Model.useValidator(model => model.state.isAlive);
    }

    constructor(
        seq: Model.Seq<Bunny>,
        parent: Model.Parent<Bunny>
    ) {
        super({
            ...seq,
            childDict: {
                ...seq.childDict
            },
            childList: {
                bunnies: [],
                ...seq.childList
            },
            memoState: {
                age: 0,
                maxAge: 10,
                isAlive: true,
                warm: 5,
                matureAge: 5,
                gender: Gender.Unknown,
                ...seq.memoState
            },
            tempState: {
            }
        }, parent);
    }

    @Model.useDebugger(false)
    @Model.useLoader()
    @Bunny.isAlive()
    private _onLoad() {
        if (this.parent instanceof Bunny) {
            console.log(this.parent.event.reproduce);
            for (const child of this.parent.child.bunnies) {
                this._onReproduce(child);
            }
            this.parent.event.reproduce.on(this, this._onReproduce);
        }
    }

    @Model.useDebugger(false)
    @Bunny.isAlive()
    private _onReproduce(bunny: Bunny) {
        if (bunny !== this && bunny.state.isAlive) {
            bunny.event.stateGet.on(this, this._onBunnyGet);
        }
    }

    @Model.useDebugger(false)
    private _onBunnyGet(event: {
        model: Bunny;
        prev: Model.State<Bunny>;
        next: Model.State<Bunny>;
        isBreak?: boolean
    }) {
        console.log('pipe', event);
        return {
            ...event,
            next: {
                ...event.next,
                warm: event.next.warm + 1
            }
        };
    }

    @Bunny.isAlive()
    die() {
        this._memoState.isAlive = false;
        this._event.die.emit(this);
        if (this.parent instanceof Bunny) {
            this.parent.clean(this);
        }
    }


    @Bunny.isAlive()
    growup() {
        this._memoState.age ++;
        if (this.state.age > this.state.matureAge && this._memoState.gender === Gender.Unknown) {
            this._memoState.gender = Random.type(
                Gender.Male,
                Gender.Female
            );
        }
        if (this.state.age >= this.state.maxAge) {
            this.die();
        }
    }

    @Bunny.isAlive()
    @Model.useValidator(model => model.state.gender === Gender.Female)
    reproduce() {
        const bunny: Bunny= this._new({
            type: 'bunny',
            memoState: {
                name: 'Lily'
            }
        });
        this._childList.bunnies?.push(bunny);
        this._event.reproduce.emit(bunny);
    }
    
    clean(bunny?: Bunny) {
        if (bunny) {
            const index = this._childList.bunnies.indexOf(bunny);
            if (index >= 0) {
                this._childList.bunnies.splice(index, 1);
            }
        } else {
            this._childList.bunnies.splice(0, this._childList.bunnies.length);
        }
        
    }
}
