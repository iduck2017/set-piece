import { Model } from ".";
import { Bunny, Gender } from "./bunny";

export class App extends Model<{
    type: 'app';
    state: {
        version: [number, number, number];
        count: number;
    },
    tempState: {
        isInit: boolean;
    },
    childDict: {
        bunny?: Bunny
    },
    parent: undefined
}> {
    private static _main?: App;
    static get main(): App {
        if (!App._main) {
            App._main = new App();
        }
        return App._main;
    }

    constructor() {
        super({
            type: 'app',
            id: Date.now().toString(36),
            memoState: {
                version: [ 0, 1, 0 ],
                count: 0
            },
            tempState: {
                isInit: false
            },
            childDict: {},
            childList: {}
        }, undefined);
        window.app = this;
    }
    
    @Model.useValidator(model => !model._tempState.isInit)
    async init() {
        this._tempState.isInit = true;
        const raw = localStorage.getItem('bunny');
        if (raw) {
            const seq: Model.Seq<Bunny> = JSON.parse(raw);
            this._childDict.bunny = this._new<Bunny>(seq);
        } else {
            this._childDict.bunny = this._new<Bunny>({
                type: 'bunny',
                memoState: {
                    name: 'Tom',
                    gender: Gender.Female
                }
            });
        }
    }

    @Model.useValidator(model => model._tempState.isInit, true)
    count() {
        this._memoState.count ++;
    }

    @Model.useDebugger(true)
    @Model.useValidator(model => model._tempState.isInit, true)
    async save() {
        const seq: Model.Seq<Bunny> | undefined = this.child.bunny?.seq;
        if (seq) {
            localStorage.setItem('bunny', JSON.stringify(seq));
        }
        return this.child.bunny?.seq;
    }

    @Model.useValidator(model => model._tempState.isInit, true)
    quit() {
        delete this._childDict.bunny;
        this._tempState.isInit = false;
    }
}