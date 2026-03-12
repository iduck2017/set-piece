import { useChild } from "../child/use-child";
import { useChildList } from "../child/use-child-list";
import { Model } from "../model";
import { runTrx } from "../transaction/use-trx";
import { useWeakRef } from "./use-weak-ref";

export class PlayerModel extends Model {
    @useWeakRef()
    private _enemy?: MonsterModel;
    public get enemy() {
        return this._enemy;
    }
    public setEnemy(enemy: MonsterModel) {
        this._enemy = enemy;
    }
}

export class MonsterModel extends Model {
    @useWeakRef()
    private _enemy?: PlayerModel;
    public get enemy() {
        return this._enemy;
    }
    public setEnemy(enemy: PlayerModel) {
        this._enemy = enemy;
    }
}

export class MonsterLairModel extends Model {
    @useChildList()
    private _monsters: MonsterModel[] = [];
    @useChild()
    private _player?: PlayerModel;

    public init(monster: MonsterModel, player: PlayerModel) {
        this._player = player;
        this._monsters.push(monster);
        player.setEnemy(monster);
        monster.setEnemy(player);
    }

    public dispose() {
        this._player = undefined;
        this._monsters = []
    }
}

describe('use-weak-ref', () => {
    const player = new PlayerModel();
    const lair = new MonsterLairModel();
    const monster = new MonsterModel();

    it('check-initial-status', () => {
        expect(player.enemy).toBe(undefined);
        expect(monster.enemy).toBe(undefined);
    });

    it('set-enemy', () => {
        player.setEnemy(monster);
        monster.setEnemy(player);
        expect(player.enemy).toBe(undefined);
        expect(monster.enemy).toBe(undefined);
    })

    it('force-set-enemy', () => {
        runTrx(() => {
            player.setEnemy(monster);
            monster.setEnemy(player);
            expect(player.enemy).toBe(monster);
            expect(monster.enemy).toBe(player);
        })
        expect(player.enemy).toBe(undefined);
        expect(monster.enemy).toBe(undefined);
    })

    it('init-lair', () => {
        lair.init(monster, player);
        expect(player.enemy).toBe(monster);
        expect(monster.enemy).toBe(player);
    })

    it('dispose-lair', () => {
        lair.dispose();
        expect(player.enemy).toBe(undefined);
        expect(monster.enemy).toBe(undefined);
    })
})