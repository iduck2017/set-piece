import { useDep } from "../lifecycle/use-dep";
import { Model } from "../model";
import { listenerContext } from "./listener";
import { useListener } from "./use-listener";
import { ChangeEvent, useObserver } from "./use-observer";

class MonsterHealthChangeEvent extends ChangeEvent<number> {}

class MonsterModel extends Model {
    constructor() {
        super();
        this.maximumHealth = 100;
        this.damage = 0;
    }

    public prevHealth?: number;

    @useDep()
    public maximumHealth: number;

    @useObserver(() => MonsterHealthChangeEvent)
    public get currentHealth(): number {
        console.log('Computed current health');
        return this.maximumHealth - this.damage;
    }

    @useDep()
    public damage: number;
    public receiveDamage() {
        console.log('Receive damage', this.damage);
        this.damage += 10;
    }

    @useListener(() => [MonsterHealthChangeEvent, MonsterModel, MonsterModel])
    private _handleHealthChange(target: unknown, event: MonsterHealthChangeEvent) {
        console.log('Handle health change', event);
        this.prevHealth = event.prev;
    }
    
}


describe('use-observer', () => {
    const monster = new MonsterModel();
    console.log('Prev MonsterModel', listenerContext.get(monster));

    it('check-initial-state', () => {
        expect(monster.currentHealth).toBe(100);
        expect(monster.maximumHealth).toBe(100);
        expect(monster.damage).toBe(0);
    })

    it('receive-damage', () => {
        monster.receiveDamage();
        expect(monster.currentHealth).toBe(90);
        expect(monster.damage).toBe(10);
        expect(monster.prevHealth).toBe(100);
    })

    it('add-maximum-health', () => {
        monster.maximumHealth += 10;
        expect(monster.currentHealth).toBe(100);
        expect(monster.maximumHealth).toBe(110);
        expect(monster.prevHealth).toBe(90);
    })
})