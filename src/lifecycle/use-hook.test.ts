import { Model } from "../model";
import { useReloadHook } from "./use-reload-hook";
import { useMountHook } from "./use-mount-hook";
import { useUnmountHook } from "./use-unmount-hook";
import { useDep } from "./use-dep";
import { useCustomChild } from "../child/use-custom-child";
import { useChild } from "../child/use-child";

const counter = {
    reload: 0,
    mount: 0,
    unmount: 0,
}

export class BarModel extends Model {
    @useChild()
    private _foo?: FooModel;

    public setChild() {
        this._foo = new FooModel();
    }

    public removeChild() {
        this._foo = undefined;
    }
}

export class FooModel extends Model {

    @useDep()
    private _isEnabled: boolean = true;
    public get isEnabled() {
        return this._isEnabled;
    }

    public disable() {
        this._isEnabled = false;
    }

    @useReloadHook()
    private handleReload() {
        console.log('handleReload', this);
        counter.reload++;
    }

    @useMountHook()
    private handleMount() {
        counter.mount++;
    }

    @useUnmountHook()
    private onUnmount() {
        counter.unmount++;
    }
}

describe('lifecycle', () => {
    const foo = new FooModel();
    const bar = new BarModel();

    it('check-initial-status', () => {
        expect(counter.reload).toBe(2);
        expect(counter.mount).toBe(0);
        expect(counter.unmount).toBe(0);
    });

    it('disable-foo', () => {
        foo.disable();
        expect(counter.reload).toBe(3);
        expect(counter.mount).toBe(0);
        expect(counter.unmount).toBe(0);
    });

    it('mount-foo', () => {
        bar.setChild();
        expect(counter.mount).toBe(1);
        expect(counter.unmount).toBe(0);
    })

    it('unmount-foo', () => {
        bar.removeChild();
        expect(counter.mount).toBe(1);
        expect(counter.unmount).toBe(1);
    })
});