import { Decor } from ".";
import { useDep } from "../dep/dep-registry";
import { Model, useModel } from "../model";
import { useDecorConsumer } from "./decor-consumer-registry";
import { useDecorProducer } from "./decor-producer-registry";
import { useState } from "./use-state";

class AttackDecor extends Decor<number> {
    private _result: number;

    constructor(origin: number, target: Model) {
        super(origin, target);
        this._result = origin;
    }

    public get result() {
        return this._result;
    }

    public add(value: number) {
        this._result += value;
    }
}

@useModel('decor-monster')
class MonsterModel extends Model {
    @useDecorProducer(() => AttackDecor)
    @useState()
    private _attack = 100;

    public get attack() {
        return this._attack;
    }

    @useDep()
    public buff = 10;

    @useDecorConsumer((self: MonsterModel) => [self, AttackDecor])
    private handleAttack(decor: AttackDecor) {
        decor.add(this.buff);
    }
}

describe('decor', () => {
    it('applies and refreshes decor producers', () => {
        const monster = new MonsterModel();

        expect(monster.attack).toBe(110);

        monster.buff = 20;
        expect(monster.attack).toBe(120);
    });
});

