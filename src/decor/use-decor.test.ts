import { Decor } from ".";
import { useDep } from "../hooks/use-dep";
import { Model } from "../model";
import { useModel } from "../hooks/use-model";
import { useDecorConsumer } from "../hooks/use-decor-consumer";
import { useDecorProducer } from "../hooks/use-decor-producer";
import { useState } from "../hooks/use-state";

class AttackDecor extends Decor<number> {
    private _result: number;

    constructor(origin: number, target: Model) {
        super(origin, target);
        this._result = origin;
    }

    public get result() { return this._result; }

    public add(value: number) {
        this._result += value;
    }
}

@useModel('decor-monster')
class MonsterModel extends Model {
    @useDecorProducer(() => AttackDecor)
    @useState()
    private _attack = 100;

    public get attack() { return this._attack; }

    @useDep()
    private _buff = 10;
    public get buff() { return this._buff; }
    public set buff(value: number) { this._buff = value; }

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
