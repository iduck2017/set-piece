import { Model } from ".";
import type { App } from "../app";
import { Base } from "../utils/base";
import { AnimalModel } from "./animal";

type RootState = {
    time: number
}

@Model.useSingleton
@Model.useProduct('root')
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
    static useTimeline(duration?: number) {
        return function (
            target: unknown,
            key: string,
            descriptor: TypedPropertyDescriptor<Base.Function>
        ): TypedPropertyDescriptor<Base.Function> {
            console.log(
                'useTimeline',
                target,
                key
            );
            const original = descriptor.value;
            descriptor.value = function(
                this: Model, 
                ...args
            ) {
                this.app.root.$rawStateMap.time += duration || 1;
                return original?.apply(this, args);
            };
            return descriptor;
        };
    }

    constructor(
        config: RootModel['config'],
        parent: App
    ) {
        // if (!config.childSet?.length) {
        //     config.childSet = [
        //         { type: 'bunny' },
        //         { type: 'kitty' }
        //     ];
        // }
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
        this.$rawStateMap.time += 1;
    }

    spawn(config: AnimalModel['config']) {
        const {
            config: $config,
            isAbort
        } = this.$eventMap.prevSpawn.emit({
            config
        });
        if (isAbort) {
            console.log('Aborted spawn');
            return;
        }
        const target: AnimalModel = this.$new($config);
        this.$childSet.push(target);
        this.$eventMap.postSpawn.emit({
            target
        });
    }

    init() {
        this.$init();
    }

}