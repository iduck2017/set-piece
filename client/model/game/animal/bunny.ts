import { IModel } from "../..";
import { Animal, IAnimal } from ".";
import { Game } from "..";
import { RawModelDefine } from "../../../type/define";
import { Features } from "./feature/features";

export type BunnyDefine = 
    RawModelDefine<{
        stateMap: {
            curAge: number;
            maxAge: number;
            isAlive: boolean;
            curDensity: number;
        },
        eventMap: {
            preReproduce: number;
            reproduce: number;
        },
        referMap: {
        },
        childMap: {
            features?: undefined;
        }
        type: 'bunny'
    }>

@IModel.useProduct('bunny')
export class Bunny extends IAnimal<
    BunnyDefine
> {
    declare parent: Game;

    constructor(
        config: Bunny['config'],
        parent: Game
    ) {
        super({
            ...config,
            childMap: {
                ...config.childMap
            },
            stateMap: {
                curAge: 0,
                maxAge: 100,
                isAlive: true,
                curDensity: 0,
                ...config.stateMap
            },
            referMap: {}
        }, parent);
    }

    @IModel.useLoader()
    protected _onActive(): void {
        if (this._rawStateMap.isAlive) {
            for (const target of this.parent.childSet) {
                this._onSpawn({ target });
            }
            this.parent.eventMap.postSpawn.bind(
                this,
                this._onSpawn
            );
        }
    }

    private _onSpawn(form: {
        target: Readonly<Animal>;
    }) {
        if (
            form.target !== this &&
            form.target instanceof Bunny
        ) {
            console.log('onSpawn', this.code, form.target.code);
            form.target.stateGetEventMap.curDensity.bind(this, form => ({
                ...form,
                cur: form.cur + 1
            }));
        }
    }

    @IModel.useDebugger()
    @IAnimal.isAlive()
    @Game.useTime()
    reproduce() {
        this.parent.spawn({
            type: 'bunny'
        });
    }

    @IModel.useDebugger()
    @IAnimal.isAlive()
    @Game.useTime()
    sacrifice() {
        this._rawStateMap.isAlive = false;
    }
}