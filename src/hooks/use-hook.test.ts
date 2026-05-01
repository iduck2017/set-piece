import { Model } from "../model";
import { useMountHook } from "./use-mount-hook";
import { useUnmountHook } from "./use-unmount-hook";
import { useChild } from "../child/use-child";

const counter = {
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
        expect(counter.mount).toBe(0);
        expect(counter.unmount).toBe(0);
    });

    it('disable-foo', () => {
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