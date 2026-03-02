import { Model } from "../model";
import { onReload } from "./on-reload";
import { onMount } from "./on-mount";
import { onUnmount } from "./on-unmount";
import { asDependency } from "./as-dependency";
import { asCustomChild } from "../child/as-custom-child";
import { asChild } from "../child/as-child";

const counter = {
    reload: 0,
    mount: 0,
    unmount: 0,
}

export class BarModel extends Model {
    @asChild()
    private _foo?: FooModel;

    public setChild() {
        this._foo = new FooModel();
    }

    public removeChild() {
        this._foo = undefined;
    }
}

export class FooModel extends Model {

    @asDependency()
    private _isEnabled: boolean = true;
    public get isEnabled() {
        return this._isEnabled;
    }

    public disable() {
        this._isEnabled = false;
    }

    @onReload()
    private handleReload() {
        console.log('handleReload', this);
        counter.reload++;
    }

    @onMount()
    private handleMount() {
        counter.mount++;
    }

    @onUnmount()
    private onUnmount() {
        counter.unmount++;
    }
}

describe('lifecycle', () => {
    const foo = new FooModel();
    const bar = new BarModel();

    it('check-initial-status', () => {
        expect(counter.reload).toBe(1);
        expect(counter.mount).toBe(0);
        expect(counter.unmount).toBe(0);
    });

    it('disable-foo', () => {
        foo.disable();
        expect(counter.reload).toBe(2);
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