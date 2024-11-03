import { Model } from "..";
import { App } from "../app";
import { Base } from "../../type/base";
import { Animal } from "./animal";
import { RawModelDefine } from "../../type/define";

export type GameDefine = 
    RawModelDefine<{
        type: 'game',
        stateMap: {
            time: number
        },
        eventMap: {
            prevSpawn: {
                config: Animal['config']
                isAbort?: boolean
            },
            postSpawn: {
                target: Animal
            }
        },
        childSet: Animal,
        parent: App
    }>

@Model.useProduct('game')
export class Game extends Model<
    GameDefine
> {
    private static _main: Game;
    static get main() {
        return this._main;
    }

    static useTime(duration?: number) {
        return function (
            target: unknown, 
            key: string,
            descriptor: TypedPropertyDescriptor<Base.Function>
        ): TypedPropertyDescriptor<Base.Function> {
            const original = descriptor.value;
            descriptor.value = function(
                this: Model, 
                ...args
            ) {
                Game.main._rawStateMap.time += duration || 1;
                return original?.apply(this, args);
            };
            return descriptor;
        };
    }

    constructor(
        config: Game['config'],
        parent: App
    ) {
        if (!config.childSet?.length) {
            config.childSet = [
                { type: 'bunny' },
                { type: 'kitty' }
            ];
        }
        super({
            ...config,
            childMap: {},
            stateMap: {
                time: 0,
                ...config.stateMap
            },
            referMap: {}
        }, parent);
        Game._main = this;
    }

    @Model.useDebugger()
    tick() {
        this._rawStateMap.time += 1;
    }

    spawn(config: Animal['config']) {
        const {
            config: _config,
            isAbort
        } = this._eventMap.prevSpawn.emit({
            config
        });
        if (isAbort) {
            console.log('Aborted spawn');
            return;
        }
        const target: Animal = this._new(_config);
        this._childSet.push(target);
        this._eventMap.postSpawn.emit({
            target
        });
    }
}