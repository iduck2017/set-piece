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
    memoState: {
        readonly name: string
        age: number;
        maxAge: number;
        gender: Gender;
        isAlive: boolean;
    },
    tempState: {
        readonly warm: number;
        readonly matureAge: number
    },
    childDict: {
    }
    childList: {
        bunnies: Bunny[],
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
                bunnies: [ { type: 'bunny' } ],
                ...seq.childList
            },
            memoState: {
                age: 0,
                maxAge: 10,
                isAlive: true,
                gender: Gender.Unknown,
                name: 'Lucy',
                ...seq.memoState
            },
            tempState: {
                warm: 0,
                matureAge: 3
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
                this._onSpawn(child);
            }
            this._bind(this.parent.event.reproduce, this._onSpawn);
        } else {
            this._onSpawn(this);
        }
    }

    @Model.useDebugger(true)
    private _onDie(bunny: Bunny) {
        console.log(bunny);
        this._unbind(bunny.event.stateCheck, this._onBunnyCheck);
        this._unbind(bunny.event.reproduce, this._onSpawn);
        this._unbind(bunny.event.die, this._onDie);
    }

    @Model.useDebugger(false)
    @Bunny.isAlive()
    private _onSpawn(bunny: Bunny) {
        if (bunny.state.isAlive) {
            this._bind(bunny.event.stateCheck, this._onBunnyCheck);
            this._bind(bunny.event.die, this._onDie);
        }
    }

    @Model.useDebugger(false)
    private _onBunnyCheck(event: {
        target: Bunny;
        prev: Model.State<Bunny>;
        next: Model.State<Bunny>;
        isBreak?: boolean
    }) {
        return {
            ...event,
            next: {
                ...event.next,
                warm: event.next.warm + (event.target === this ? 5 : 1)
            }
        };
    }

    @Bunny.isAlive()
    die() {
        this._memoState.isAlive = false;
        this._unlisten(this._onSpawn);
        this._unlisten(this._onBunnyCheck);
        this._emit(this.event.die, this);
    }


    @Bunny.isAlive()
    growup() {
        this._memoState.age ++;
        if (this.state.age > this.state.matureAge && this._memoState.gender === Gender.Unknown) {
            this._memoState.gender = Random.type(Gender.Male, Gender.Female);
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
        this._emit(
            this.event.reproduce,
            bunny
        );
    }
    
    clean(bunny?: Bunny) {
        if (bunny) {
            const index = this._childList.bunnies.indexOf(bunny);
            if (index >= 0) this._childList.bunnies.splice(index, 1);
        } else {
            this._childList.bunnies.splice(0, this._childList.bunnies.length);
        }
    }
}
