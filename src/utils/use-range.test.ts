import { Model } from "../model";
import { useRange } from "./use-range";

class MonsterModel extends Model {
    @useRange(0, 100)
    private _health = 999;
    public get health() {
        return this._health;
    }
    public recvDamage(damage: number) {
        this._health -= damage;
    }

    @useRange(0, undefined)
    private _attack = 100;
    public get attack() {
        return this._attack;
    }
    public setAttack(attack: number) {
        this._attack = attack;
    }
}

describe('utils', () => {
    it('check-monster-health', () => {
        const monster = new MonsterModel();
        expect(monster.health).toBe(100);
        monster.recvDamage(999);
        expect(monster.health).toBe(0);
    });

    it('check-monster-attack', () => {
        const monster = new MonsterModel();
        expect(monster.attack).toBe(100);
        monster.setAttack(-100);
        expect(monster.attack).toBe(0);
    })
});
