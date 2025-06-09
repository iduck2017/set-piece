import { Model } from "../model";
import { Agent } from "./agent";
import { TranxService } from "../service/tranx";

export class RouteAgent<
    M extends Model = Model,
    P extends Model = Model,
> extends Agent<M> {

    private _key: string | undefined;
    
    private _isBind: boolean;
    
    private _parent: P | undefined;



    public get key() { return this._key; }

    public get isBind() { return this._isBind; }

    public get parent() { return this._parent; }

    public get root(): Model { 
        if (this.parent) {
            return this.parent.agent.route.root;
        }
        return this.target;
    }



    constructor(target: M) {
        super(target);
        this._isBind = false;
    }


    @TranxService.diff()
    @TranxService.use()
    public bind(parent: P | undefined, key: string) {
        this._isBind = true;
        this._key = key;
        this._parent = parent;
    }

    @TranxService.diff()
    @TranxService.use()
    public unbind() {
        this._isBind = false;
        this._key = undefined;
        this._parent = undefined;
    }

    @TranxService.diff()
    @TranxService.use()
    public reload() {}




    public load() {
        if (RouteAgent.root.includes(this.root)) {
            this.agent.event.load();
            this.agent.state.load();
        }
    }

    public unload() {
        this.agent.refer.unload();
        this.agent.event.unload();
        this.agent.state.unload();
    }

    public uninit() {
        this.agent.refer.uninit();
        this.agent.event.uninit();
        this.agent.state.uninit();
    }



    public static root: Model[] = [];

    public static boot<T extends Model>(root: T): T {
        if (RouteAgent.root.includes(root)) return root;
        console.log('boot', root.name)
        RouteAgent.root.push(root);
        root.agent.route.bind(undefined, 'root')
        return root;
    }
}
