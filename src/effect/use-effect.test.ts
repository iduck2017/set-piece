import { useDep } from "../dep/use-dep";
import { depManager } from "../dep/dep-manager";
import { Model } from "../model";
import { effectManager } from "./effect-manager";
import { useEffect } from "./use-effect";
import { fieldRegistry } from "../utils/field-registry";
import { depCollector } from "../dep/dep-collector";

class FooModel extends Model {
    @useDep()
    public kelvin: number = 3

    private _prev?: number;
    public get prev() {
        return this._prev;
    }

    @useEffect()
    logTemp() {
        this._prev = this.kelvin;
    }

    constructor() {
        super();
        this.init();
    }
}

describe('useEffect', () => {
    const a = new FooModel();
    const effectField = fieldRegistry.query(a, 'logTemp');
    const dep = fieldRegistry.query(a, 'kelvin');

    it('should work', () => {
        expect(effectManager.query(dep).length).toBe(1);
        expect(depManager.query(effectField).length).toBe(1);
        expect(depCollector.query(effectField).length).toBe(0);
    })

    it('should re-run', () => {
        a.kelvin = 5;
        expect(a.prev).toEqual(5);
    })
})
