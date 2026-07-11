import { useDep } from "../hooks/use-dep";
import { Model } from "../model";
import { useModel } from "../hooks/use-model";
import { useEffect } from "../hooks/use-effect";

@useModel('effect-demo')
class EffectModel extends Model {
    @useDep()
    private _count = 1;
    public get count() { return this._count; }
    public set count(value: number) { this._count = value; }

    private _records: number[] = [];
    public get records() { return this._records; }

    @useEffect()
    private recordCount() {
        this._records.push(this.count);
    }
}

describe('useEffect', () => {
    it('runs effect during action flush', () => {
        const model = new EffectModel();

        expect(model.records).toEqual([1]);

        model.count = 2;
        expect(model.records).toEqual([1, 2]);
    });
});
