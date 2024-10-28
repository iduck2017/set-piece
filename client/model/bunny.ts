import { Model } from ".";
import { AnimalModel, IAnimalModel } from "./animal";
import { RootModel } from "./root";

export type BunnyState = {
    curDensity: number;
}

export type BunnyEvent = {
    preReproduce: number;
    reproduce: number;
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
            childMap: {},
            stateMap: {
                curAge: 0,
                maxAge: 100,
                isAlive: true,
                curDensity: 0,
                ...config.stateMap
            }
        }, parent);
    }

    @Model.onInit()
    protected $onInit(): void {
        console.log('BunnyModel init');
        for (const target of this.parent.childSet) {
            this.#onSpawn({ target });
        }
        this.parent.eventMap.postSpawn.bind(
            this,
            this.#onSpawn
        );
    }

    #onSpawn(form: {
        target: Readonly<AnimalModel>;
    }) {
        if (
            form.target !== this &&
            form.target instanceof BunnyModel
        ) {
            console.log('onSpawn', this.code, form.target.code);
            form.target.stateGetEventMap.curDensity.bind(
                this,
                form => ({
                    ...form,
                    cur: form.cur + 1
                })
            );
        }
    }

    @Model.onUninit()
    protected $onUninit() {
        console.log('BunnyModel uninit');
    }

    @IAnimalModel.isAlive()
    @RootModel.useTimeline()
    @Model.useDebug()
    reproduce() {
        this.parent.spawn({
            type: 'bunny'
        });
    }

    @RootModel.useTimeline()
    @Model.useDebug()
    sacrifice() {
        this.$unmount();
    }
}