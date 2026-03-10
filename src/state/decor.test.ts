import { useChildList } from "../child/use-child-list";
import { Model } from "../model";
import { useState } from "./use-state";
import { Decor } from "./decor";
import { modifierContext } from "./modifier";
import { useModifier } from "./use-modifier";
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
        useModifier(() => [AttackDecor, MonsterModel, Model])(prototype, key, descriptor);
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
        useModifier(() => [AttackDecor, MonsterLairModel, Model])(prototype, key, descriptor);
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
    @useState()
    @useDecor<MonsterModel, '_attack'>(() => AttackDecor)
    private _attack = 100;
    public get attack() {
        return this._attack;
    }

    public setAttack(attack: number) {
        this._attack = attack;
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
    @useChildList()
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
    console.log('Prev ListenerRegistry', modifierContext.get(monsterA))

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

    it('remove-monster', () => {
        lair.removeMonster(monsterA);
        expect(monsterA.attack).toBe(110);
        expect(monsterB.attack).toBe(110);
    })

    it('set-attack', () => {
        monsterA.setAttack(0);
        expect(monsterA.attack).toBe(10);
    })
});