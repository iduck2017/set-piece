import { Model } from "../model";
import { listChild, asCustomChild } from "./as-custom-child";
import { asChild } from "./as-child";

class PineappleModel extends Model {
}

class BoxModel extends Model {
    @asChild()
    private _pineapple?: PineappleModel = new PineappleModel();
    public get pineapple() {
        return this._pineapple;
    }
    public putPineapple(pineapple: PineappleModel) {
        this._pineapple = pineapple;
    }
    public takePineapple() {
        this._pineapple = undefined;
    }
}


describe('child', () => {
    const box = new BoxModel();
    const pineappleA = box.pineapple;
    const pineappleB = new PineappleModel();

    it('box', () => {
        expect(pineappleA?.parent).toBe(box);
        expect(box.pineapple).toBe(pineappleA)
    });

    it('list-child', () => {
        const children = listChild(box);
        expect(children).toContain(pineappleA);
        expect(children.length).toBe(1)
    });

    it('set-pineapple', () => {
        box.putPineapple(pineappleB);
        expect(pineappleB?.parent).toBe(box);
        expect(pineappleA?.parent).toBeUndefined();
        expect(box.pineapple).toBe(pineappleB)
    });

    it('remove-pineapple', () => {
        box.takePineapple();
        expect(pineappleB?.parent).toBeUndefined();
        expect(box.pineapple).toBeUndefined()
    });

    
});