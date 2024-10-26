import { Model } from ".";
import type { App } from "../app";
import { AnimalModel } from "./animal";

type RootState = {
    progress: number
}

@Model.useProduct('root')
export class RootModel extends Model<
    'root',
    RootState,
    {},
    AnimalModel,
    {
        prevSpawn: {
            config: AnimalModel['config']
            isAbort?: boolean
        },
        postSpawn: {
            target: AnimalModel
        }
    }
> {
    constructor(
        config: RootModel['config'],
        parent: App
    ) {
        if (!config.child) {
            config.child = {
                list: []
            };
            if (!config.child.list?.length) {
                config.child.list = [];
            }
            config.child.list.push({
                code: 'bunny',
                state: {
                    curDensity: 3
                }
            }, {
                code: 'kitty',
                state: {
                    name: 'Kelly'
                }
            });
        }
        super({
            ...config,
            child: {
                ...config.child,
                dict: config.child?.dict || {}
            },
            state: {
                progress: 0,
                ...config.state
            }
        }, parent);
    }

    @Model.useDebug()
    add() {
        this.$state.progress += 1;
    }

    @Model.useDebug()
    minus() {
        if (this.$state.progress > 0) {
            this.$state.progress -= 1;
        }
    }

    spawn(config: AnimalModel['config']) {
        const {
            config: $config,
            isAbort
        } = this.$event.base.prevSpawn.emit({
            config
        });
        if (isAbort) {
            console.log('Aborted spawn');
            return;
        }
        const target: AnimalModel = this.$new($config);
        this.$child.list.push(target);
        this.$event.base.postSpawn.emit({
            target
        });
    }

    activate() {
        console.log('activate', this, this.$activateAll);
        this.$activateAll();
    }

}