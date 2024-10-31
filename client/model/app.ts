import { Model } from ".";
import { Game } from "./game";
import { Service } from "./service";
import { Inspector } from "./service/inspector";
import { RawModelDefine } from "../type/define";

export type AppDefine = RawModelDefine<{
    type: 'app',
    stateMap: {
        version: [number, number, number],
    },
    childMap: {
        game?: Game,
        service?: Service,
    }
}>

export class App extends Model<AppDefine> {
    private static _main?: App;
    static get main(): App {
        if (!App._main) App._main = new App();
        return App._main;
    }

    static get service(): Service {
        const app = App.main._childMap.service;
        if (!app) throw new Error('App not found');
        return app;
    }
    static get game(): Game {
        const root = App.main._childMap.game;
        if (!root) throw new Error('Root not found');
        return root;
    }

    constructor() {
        super({
            type: 'app',
            code: Date.now().toString(36),
            stateMap: {
                version: [0, 1, 0]
            },
            childMap: {}
        });
    }
    
    async init() {
        const raw = await localStorage.getItem('service');
        const config: Service['config'] = raw ? 
            JSON.parse(raw) : { 
                type: 'service' 
            };
        this._childMap.service = this._new(config);
    }

    async start(config: Game['config']) {
        this._childMap.game = this._new(config);
    }

    async quit() {
        delete this._childMap.game;
    }
}

App.main.init();