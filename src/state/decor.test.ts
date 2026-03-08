import { asChildList } from "../child/as-child-list";
import { Model } from "../model";
import { asState } from "./as-state";
import { Decor } from "./decor";
import { decorListenerRegistry } from "./listener";
import { onCalc } from "./on-calc";
import { useDecor } from "./use-decor";

class AttackDecor extends Decor<number> {
    public result: number;
    
    constructor(origin: number) {
        super(origin);
        this.result = origin;
    }
}

function onCalcMonsterAttack() {
    return function(
        prototype: MonsterModel,
        key: string,
        descriptor: TypedPropertyDescriptor<(target: Model, decor: AttackDecor) => void>
    ) {
        onCalc(() => [AttackDecor, MonsterModel])(prototype, key, descriptor);
        const method = descriptor.value;
        if (!method) return;
        descriptor.value = function(this: MonsterModel, target: Model, decor: AttackDecor) {
            console.log('Check self', this, target);
            if (this !== target) return;
            method.call(this, target, decor);
        }
        return descriptor;
    }
}

function onCalcMonsterAllyAttack() {
    return function(
        prototype: MonsterModel,
        key: string,
        descriptor: TypedPropertyDescriptor<(target: Model, decor: AttackDecor) => void>
    ) {
        onCalc(() => [AttackDecor, MonsterLairModel])(prototype, key, descriptor);
        const method = descriptor.value;
        if (!method) return;  
        descriptor.value = function(this: MonsterModel, target: Model, decor: AttackDecor) {
            console.log('Check ally', this, target);
            if (this.parent !== target.parent) return;
            if (this === target) return;
            method.call(this, target, decor);
        }
        return descriptor;
    }
}

class MonsterModel extends Model {
    @asState()
    @useDecor<MonsterModel, '_attack'>(() => AttackDecor)
    private _attack = 100;
    public get attack() {
        return this._attack;
    }
    
    @onCalcMonsterAttack()
    private handleAttack(target: Model, decor: AttackDecor) {
        decor.result += 10;
        console.log('handleAttack', target, decor.result);
    }

    @onCalcMonsterAllyAttack()
    private handleAllyAttack(target: Model, decor: AttackDecor) {
        decor.result += 5;
        console.log('handleAllyAttack', target, decor.result);
    }
}


class MonsterLairModel extends Model {
    @asChildList()
    private _monsters: MonsterModel[] = [];
    public get monsters() {
        return this._monsters;
    }

    public addMonster(monster: MonsterModel) {
        this._monsters.push(monster);
    }

    public removeMonster(monster: MonsterModel) {
        const index = this._monsters.indexOf(monster);
        if (index === -1) return;
        this._monsters.splice(index, 1);
    }
}


describe('decor', () => {
    const lair = new MonsterLairModel();
    const monsterA = new MonsterModel();
    const monsterB = new MonsterModel();
    console.log('Prev ListenerRegistry', decorListenerRegistry.get(monsterA))

    it('check-attack', () => {
        expect(monsterA.attack).toBe(110);
        lair.addMonster(monsterA);
        expect(monsterA.attack).toBe(110);
        expect(monsterB.attack).toBe(110);
    });

    it('add-monster', () => {
        lair.addMonster(monsterB);
        expect(monsterA.attack).toBe(115);
        expect(monsterB.attack).toBe(115);
    })
});