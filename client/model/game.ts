import { Factory } from "@/service/factory";
import { Lifecycle } from "@/service/lifecycle";
import { AppModel } from "./app";
import { DictModel } from "./dict";
import { NodeProps } from "@/type/props";

type GameDef = {
    code: 'game',
    parent: AppModel
}

@Factory.useProduct('game')
export class GameModel extends DictModel<GameDef> {
    private static _core?: GameModel;
    static get core(): GameModel {
        if (!GameModel._core) {
            console.error('[game-uninited]');
            throw new Error();
        }
        return GameModel._core;
    }

    constructor(props: NodeProps<GameDef>) {
        super({
            ...props,
            child: {},
            state: {}
        });
    }

   
    @Lifecycle.useLoader()
    private _register() {
        GameModel._core = this;
    }

    @Lifecycle.useUnloader()
    private _unregister() {
        delete GameModel._core;
    }
}