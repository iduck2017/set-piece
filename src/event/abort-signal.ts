import { Event } from "./event";

export class AbortSignal extends Event {
    private _isAborted: boolean = false;
    public get isAborted() {
        return this._isAborted;
    }
    public abort() {
        this._isAborted = true;
    }
}