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

@Model._useProduct('bunny')
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
    protected _onInit(): void {
        console.log('BunnyModel init');
        for (const target of this.parent.childSet) {
            this._onSpawn({ target });
        }
        this.parent.eventMap.postSpawn.bind(
            this,
            this._onSpawn
        );
    }

    private _onSpawn(form: {
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
    protected _onUninit() {
        console.log('BunnyModel uninit');
    }

    @Model.useDebug()
    @IAnimalModel.isAlive()
    @RootModel.useTime()
    reproduce() {
        this.parent.spawn({
            type: 'bunny'
        });
    }

    @Model.useDebug()
    @RootModel.useTime()
    sacrifice() {
        this._rawStateMap.isAlive = false;
    }
}