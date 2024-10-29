import { Model } from ".";
import type { App } from "../app";
import { Base } from "../utils/base";
import { Global } from "../utils/global";
import { AnimalModel } from "./animal";

type RootState = {
    time: number
}

@Model._useProduct('root')
@Global.useSingleton
@Model._useRoot()
export class RootModel extends Model<
    'root',
    RootState,
    {
        prevSpawn: {
            config: AnimalModel['config']
            isAbort?: boolean
        },
        postSpawn: {
            target: AnimalModel
        }
    },
    Record<never, never>,
    AnimalModel
> {
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
                this.root._rawStateMap.time += duration || 1;
                return original?.apply(this, args);
            };
            return descriptor;
        };
    }

    constructor(
        config: RootModel['config'],
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
            }
        }, parent);
    }

    @Model.useDebug()
    tick() {
        this._rawStateMap.time += 1;
    }

    spawn(config: AnimalModel['config']) {
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
        const target: AnimalModel = this._new(_config);
        this._childSet.push(target);
        this._eventMap.postSpawn.emit({
            target
        });
    }
}