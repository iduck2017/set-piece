import { IModel } from ".";
import { Game } from "./game";
import { Service } from "./service";
import { RawModelDefine } from "../type/define";
import { createRoot } from "react-dom/client";
import { ModelComp } from "../util/model";
import React from "react";

export type AppDefine = RawModelDefine<{
    type: 'app',
    stateMap: {
        version: [number, number, number],
    },
    referMap: {
        isInit: boolean,
    }
    childMap: {
        game?: Game,
        service?: Service,
    },
    parent: undefined,
}>

export class App extends IModel<AppDefine> {
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
            code: Date.now().toString(36),
            stateMap: {
                version: [ 0, 1, 0 ]
            },
            referMap: {
                isInit: false
            },
            childMap: {}
        }, undefined);
        window.app = this;
        createRoot(document.body).render(<ModelComp model={this} />);
    }
    
    @IModel.useDebugger()
    @IModel.useValidator(model => !model._rawReferMap.isInit)
    async init() {
        const gameConfig: Service['config'] = {
            type: 'service'
        };
        const raw = await localStorage.getItem('service');
        const config: Service['config'] = raw ? 
            JSON.parse(raw) : 
            gameConfig;
        this._childMap.service = this._new(config);
        this._rawReferMap.isInit = true;
    }

    start(config: Game['config']) {
        if (this._childMap.game) {
            throw new Error('Game already exists');
        }
        this._childMap.game = this._new(config);
    }

    quit() {
        if (!this._childMap.game) {
            throw new Error('Game not exists');
        }
        delete this._childMap.game;
    }
}

App.main;