import { macroTaskManager } from "../task/macro-task-manager";
import { useChild } from "../child/use-child";
import { Model } from "../model";
import { useWeakRef } from "./use-weak-ref";
import { useMacroTask } from "../task/use-macro-task";

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
    @useChild()
    private _monsters: MonsterModel[] = [];
    @useChild()
    private _player?: PlayerModel;

    @useMacroTask()
    public prepare(monster: MonsterModel, player: PlayerModel) {
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

const player = new PlayerModel();
const lair = new MonsterLairModel();
const monster = new MonsterModel();

player.setEnemy(monster);
monster.setEnemy(player);
console.log(player.enemy);
console.log(monster.enemy);

lair.prepare(monster, player);
console.log(player.root);
console.log(monster.root)
console.log(player.enemy);
console.log(monster.enemy);

// lair.dispose();
// console.log(player.enemy);
// console.log(monster.enemy)

// describe('use-weak-ref', () => {
//     const player = new PlayerModel();
//     const lair = new MonsterLairModel();
//     const monster = new MonsterModel();

//     it('check-initial-status', () => {
//         expect(player.enemy).toBe(undefined);
//         expect(monster.enemy).toBe(undefined);
//     });

//     it('set-enemy', () => {
//         player.setEnemy(monster);
//         monster.setEnemy(player);
//         expect(player.enemy).toBe(undefined);
//         expect(monster.enemy).toBe(undefined);
//     })

//     it('force-set-enemy', () => {
//         macroTaskManager.run(() => {
//             player.setEnemy(monster);
//             monster.setEnemy(player);
//             expect(player.enemy).toBe(monster);
//             expect(monster.enemy).toBe(player);
//         })
//         expect(player.enemy).toBe(undefined);
//         expect(monster.enemy).toBe(undefined);
//     })

//     it('init-lair', () => {
//         lair.prepare(monster, player);
//         expect(player.enemy).toBe(monster);
//         expect(monster.enemy).toBe(player);
//     })

//     it('dispose-lair', () => {
//         lair.dispose();
//         expect(player.enemy).toBe(undefined);
//         expect(monster.enemy).toBe(undefined);
//     })
// })