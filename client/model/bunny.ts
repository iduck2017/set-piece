import { Model } from ".";
import { AnimalModel, IAnimalModel } from "./animal";
import { RootModel } from "./root";

type BunnyState = {
    curDensity: number;
}

@Model.useProduct('bunny')
export class BunnyModel extends IAnimalModel<
    'bunny',
    BunnyState
> {
    declare parent: RootModel;

    constructor(
        config: BunnyModel['config'],
        parent: RootModel
    ) {
        super({
            ...config,
            child: {
                ...config.child,
                dict: config.child?.dict || {}
            },
            state: {
                curAge: 0,
                maxAge: 100,
                curDensity: 0,
                ...config.state
            }
        }, parent);
    }

    protected $activate(): void {
        console.log(this.parent.child.list);
        for (const target of this.parent.child.list) {
            this.#handleSpawn({ target });
        }
        this.parent.event.base.postSpawn.on(
            this,
            this.#handleSpawn
        );
    }

    #handleSpawn(form: {
        target: Readonly<AnimalModel>;
    }) {
        console.log('handleSpawn', form.target);
        if (
            form.target !== this &&
            form.target instanceof BunnyModel
        ) {
            form.target.event.state.edit.curDensity.on(
                this,
                (form) => ({
                    ...form,
                    next: form.next + 1
                })
            );
        }
    }

    @Model.useDebug()
    reproduce() {
        this.parent.spawn({
            code: 'bunny'
        });
    }

    @Model.useDebug()
    sacrifice() {
        this.$unmount();
    }
}