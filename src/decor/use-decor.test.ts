import { Decor } from ".";
import { useChild } from "../child/use-child";
import { useDep } from "../dep/use-dep";
import { useEffect } from "../effect/use-effect";
import { useMemo } from "../memo/use-memo";
import { Model } from "../model";
import { useRoute } from "../route/use-route";
import { useDecorConsumer } from "./use-decor-consumer";
import { useDecorProducer } from "./use-decor-producer";
import { useState } from "./use-state";

class AttackDecor extends Decor<number> {
    public result: number;
    
    constructor(origin: number, target: Model) {
        super(origin, target);
        this.result = origin;
    }
}

function useMonsterAttackDecorConsumer() {
    return function(
        prototype: MonsterModel,
        key: string,
        descriptor: TypedPropertyDescriptor<(decor: AttackDecor) => void>
    ) {
        return useDecorConsumer((i: MonsterModel) => [i, AttackDecor])(prototype, key, descriptor);
    }
}

function useMonsterAllyAttackDecorConsumer() {
    return function(
        prototype: MonsterModel,
        key: string,
        descriptor: TypedPropertyDescriptor<(decor: AttackDecor) => void>
    ) {
        return useDecorConsumer((i: MonsterModel) => [i.lair?.monsters, AttackDecor])(prototype, key, descriptor);
    }
}

class MonsterModel extends Model {
    constructor(name: string) {
        super()
        this._name = name;
        this.init()
    }
    private _name?: string;
    public get name() {
        return this._name ?? super.name;
    }

    @useDecorProducer(() => AttackDecor)
    @useState()
    private _attack = 100;
    public get attack() {
        return this._attack;
    }

    @useRoute(() => MonsterLairModel)
    public readonly lair?: MonsterLairModel;

    @useDep()
    public buff = 10

    @useDep()
    public aura = 5

    public setAttack(attack: number) {
        this._attack = attack;
    }
    
    @useMonsterAttackDecorConsumer()
    private handleAttack(decor: AttackDecor) {
        decor.result += this.buff;
    }

    @useMonsterAllyAttackDecorConsumer()
    private handleAllyAttack(decor: AttackDecor) {
        decor.result += this.aura;
    }


    private _prevAttack?: number;

    @useEffect()
    private checkAttack() {
        console.log('Attack changed', this._prevAttack, this._attack);
        this._prevAttack = this._attack
    }
}


class MonsterLairModel extends Model {
    constructor() {
        super()
        this.init()
    }

    @useChild()
    private _monsters: MonsterModel[] = [];
    @useMemo()
    public get monsters() {
        return [...this._monsters];
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
    const monsterA = new MonsterModel('Alan');
    const monsterB = new MonsterModel('Bob');

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

    
    it('buff-monster', () => {
        monsterA.aura = 10;
        expect(monsterA.attack).toBe(115);
        expect(monsterB.attack).toBe(120)
    })

    it('remove-monster', () => {
        lair.removeMonster(monsterA);
        expect(monsterA.attack).toBe(110);
        expect(monsterB.attack).toBe(110);
    })

    it('buff-monster', () => {
        monsterA.buff = 20;
        expect(monsterA.attack).toBe(120);
        expect(monsterB.attack).toBe(110)
    })
});