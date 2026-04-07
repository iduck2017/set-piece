import { Decor } from ".";
import { useChild } from "../child/use-child";
import { depManager } from "../dep/dep-manager";
import { useDep } from "../dep/use-dep";
import { useMemo } from "../memo/use-memo";
import { Model } from "../model";
import { useRoute } from "../route/use-route";
import { fieldRegistry } from "../utils/field-registry";
import { decorManager } from "./decor-manager";
import { decorProducerManager } from "./decor-producer-manager";
import { decorConsumerManager } from "./decor-consumer-manager";
import { useDecor } from "./use-decor";
import { useState } from "../state/use-state";

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
        descriptor: TypedPropertyDescriptor<(decor: AttackDecor) => void>
    ) {
        return useDecor((i: MonsterModel) => [i, AttackDecor])(prototype, key, descriptor);
    }
}

function onCalcMonsterAllyAttack() {
    return function(
        prototype: MonsterModel,
        key: string,
        descriptor: TypedPropertyDescriptor<(decor: AttackDecor) => void>
    ) {
        useDecor((i: MonsterModel) => [
            i.lair?.monsters,
            AttackDecor
        ])(prototype, key, descriptor);

        const method = descriptor.value;
        if (!method) return;  
        descriptor.value = function(this: MonsterModel, decor: AttackDecor) {
            method.call(this, decor);
        }
        return descriptor;
    }
}

class MonsterModel extends Model {
    constructor() {
        super()
        this.init()
    }

    @useState(() => AttackDecor)
    private _attack = 100;
    public get attack() {
        return this._attack;
    }

    @useRoute(() => MonsterLairModel)
    public lair?: MonsterLairModel;


    @useDep()
    public buff = 10

    public setAttack(attack: number) {
        this._attack = attack;
    }
    
    @onCalcMonsterAttack()
    private handleAttack(decor: AttackDecor) {
        decor.result += this.buff;
        console.log('handleAttack', decor.result);
    }

    @onCalcMonsterAllyAttack()
    private handleAllyAttack(decor: AttackDecor) {
        decor.result += 5;
    }
}


class MonsterLairModel extends Model {
    @useChild()
    private _monsters: MonsterModel[] = [];

    @useMemo()
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
    const handleAttackField = fieldRegistry.query(monsterA, 'handleAllyAttack')
    // console.log(decorModifierManager.query(monsterA));
    // console.log(decorEmitterManager.query(handleAttackField))

    it('check-attack', () => {
        expect(monsterA.attack).toBe(110);
        expect(monsterB.attack).toBe(110);
        console.log('dep', depManager.query(handleAttackField))
    });

    it('add-monster', () => {
        lair.addMonster(monsterA);
        expect(monsterA.attack).toBe(115);
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