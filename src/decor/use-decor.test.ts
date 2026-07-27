import { BoolDecor, NumDecor } from ".";
import { useDep } from "../hooks/use-dep";
import { Model } from "../model";
import { useModel } from "../hooks/use-model";
import { useDecorConsumer } from "../hooks/use-decor-consumer";
import { useDecorProducer } from "../hooks/use-decor-producer";
import { useState } from "../hooks/use-state";

class AttackDecor extends NumDecor {}
class GuardDecor extends BoolDecor {}

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
        if (this.buff < 0) {
            decor.set(0);
            return;
        }
        decor.add(this.buff);
    }
}

@useModel('decor-guard')
class GuardModel extends Model {
    @useDecorProducer(() => GuardDecor)
    @useState()
    private _active = true;

    public get active() { return this._active; }

    @useDep()
    private _blocked = false;
    public get blocked() { return this._blocked; }
    public set blocked(value: boolean) { this._blocked = value; }

    @useDecorConsumer((self: GuardModel) => [self, GuardDecor])
    private handleGuard(decor: GuardDecor) {
        if (this.blocked) decor.set(false);
    }
}

describe('decor', () => {
    it('applies and refreshes decor producers', () => {
        const monster = new MonsterModel();

        expect(monster.attack).toBe(110);

        monster.buff = 20;
        expect(monster.attack).toBe(120);

        monster.buff = -1;
        expect(monster.attack).toBe(0);
    });

    it('applies boolean decor producers', () => {
        const guard = new GuardModel();

        expect(guard.active).toBe(true);

        guard.blocked = true;
        expect(guard.active).toBe(false);

        guard.blocked = false;
        expect(guard.active).toBe(true);
    });
});
