import { Model } from "../src/model";
import { actionManager } from "../src/effect/action-manager";
import { useModel } from "../src/hooks/use-model";
import { useState } from "../src/hooks/use-state";
import { useStore } from "../src/hooks/use-store";
import { useChild } from "../src/hooks/use-child";
import { useEffect } from "../src/hooks/use-effect";
import { useRef } from "../src/hooks/use-ref";
import { storeService } from "../src/store/store-service";

@useStore('effect-monster')
@useModel()
class Monster extends Model {
    @useState()
    public attack = 10;

    @useChild()
    public buff?: Buff;
}

@useStore('effect-buff')
@useModel()
class Buff extends Model {
    @useRef()
    private _monster?: Monster;

    public effectRuns = 0;

    @useEffect()
    private updateAttack() {
        this.effectRuns += 1;
        const monster = this.parent instanceof Monster ? this.parent : undefined;
        if (monster === this._monster) return;

        const previous = this._monster;
        this._monster = monster;
        if (previous) previous.attack -= 1;
        if (monster) monster.attack += 1;
    }
}

describe('monster buff', () => {
    it('updates both monsters attack when transferring a buff', () => {
        const a = new Monster();
        const b = new Monster();
        const buff = new Buff();

        expect(a.attack).toBe(10);
        expect(b.attack).toBe(10);

        a.buff = buff;
        expect(buff.parent).toBe(a);
        expect(a.attack).toBe(11);
        expect(b.attack).toBe(10);

        actionManager.launch(() => {
            a.buff = undefined;
            b.buff = buff;
        });

        expect(a.buff).toBeUndefined();
        expect(b.buff).toBe(buff);
        expect(buff.parent).toBe(b);
        expect(a.attack).toBe(10);
        expect(b.attack).toBe(11);
    });

    it('matches a direct transfer after saving and restoring the buff on a', () => {
        const a = new Monster();
        const b = new Monster();
        const buff = new Buff();
        a.buff = buff;
        expect([a.attack, b.attack]).toEqual([11, 10]);

        // Serialize before transferring so both paths start from the same state.
        const saved = JSON.parse(JSON.stringify([
            storeService.save(a),
            storeService.save(b),
        ]));
        expect(saved[0].buff._monster).toBe(a.uuid);

        actionManager.launch(() => {
            a.buff = undefined;
            b.buff = buff;
        });
        expect([a.attack, b.attack]).toEqual([10, 11]);

        const restoredA = storeService.load(saved[0]);
        const restoredB = storeService.load(saved[1]);
        expect(restoredA).toBeInstanceOf(Monster);
        expect(restoredB).toBeInstanceOf(Monster);
        if (!(restoredA instanceof Monster) || !(restoredB instanceof Monster)) {
            throw new Error('Expected restored monsters.');
        }
        const restoredBuff = restoredA.buff;
        expect(restoredBuff).toBeInstanceOf(Buff);
        if (!restoredBuff) throw new Error('Expected a restored buff.');

        expect(restoredA).not.toBe(a);
        expect(restoredBuff).not.toBe(buff);
        expect(restoredBuff.uuid).toBe(buff.uuid);
        expect(restoredBuff.parent).toBe(restoredA);
        // Initialization runs the effect, but must not apply the bonus again.
        expect(restoredBuff.effectRuns).toBeGreaterThan(0);
        expect([restoredA.attack, restoredB.attack]).toEqual([11, 10]);

        actionManager.launch(() => {
            restoredA.buff = undefined;
            restoredB.buff = restoredBuff;
        });
        expect(restoredA.buff).toBeUndefined();
        expect(restoredB.buff).toBe(restoredBuff);
        expect(restoredBuff.parent).toBe(restoredB);
        expect([restoredA.attack, restoredB.attack]).toEqual([10, 11]);
        expect([restoredA.attack, restoredB.attack]).toEqual([a.attack, b.attack]);
        expect([a.attack, b.attack]).toEqual([10, 11]);
    });
});
