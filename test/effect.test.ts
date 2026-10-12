import { useDep } from "../src/hooks/use-dep";
import { Model } from "../src/model";
import { useModel } from "../src/hooks/use-model";
import { useStore } from "../src/hooks/use-store";
import { useEffect } from "../src/hooks/use-effect";

@useStore('effect-demo')
@useModel()
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
    it('runs effect on initialization and queued construction changes, then on later writes', () => {
        const model = new EffectModel();

        // Initialization runs first; the outer action then flushes the constructor's count write.
        expect(model.records).toEqual([1, 1]);

        model.count = 2;
        expect(model.records).toEqual([1, 1, 2]);
    });
});
