import { Model } from "../model";
import { listChild, asCustomChild } from "./as-custom-child";
import { asChild } from "./as-child";
import { asChildList } from "./as-child-list";

class AppleModel extends Model {}

class PineappleModel extends Model {}

class BoxModel extends Model {
    @asChild()
    private _pineapple?: PineappleModel = new PineappleModel();
    public get pineapple() {
        return this._pineapple;
    }
    public setPineapple(pineapple: PineappleModel) {
        this._pineapple = pineapple;
    }
    public removePineapple() {
        this._pineapple = undefined;
    }

    @asChildList()
    private _apples: AppleModel[] = [];
    public get apples() {
        return [...this._apples];
    }
    public addApple(apple: AppleModel) {
        this._apples.push(apple);
    }
    public removeApple(apple: AppleModel) {
        this._apples = this._apples.filter(item => item !== apple);
    }
    public replaceApple(index: number, apple: AppleModel) {
        if (index >= this._apples.length) {
            console.warn('Index out of bounds');
            return;
        }
        this._apples[index] = apple;
    }
}


describe('child', () => {
    const box = new BoxModel();
    const pineappleA = box.pineapple;
    const pineappleB = new PineappleModel();

    const redApple = new AppleModel();
    const greenApple = new AppleModel();


    it('check-initial-state', () => {
        expect(pineappleA?.parent).toBe(box);
        expect(box.pineapple).toBe(pineappleA)
    });

    it('list-child', () => {
        const children = listChild(box);
        expect(children).toContain(pineappleA);
        expect(children.length).toBe(1)
    });

    it('set-pineapple', () => {
        box.setPineapple(pineappleB);
        expect(pineappleB?.parent).toBe(box);
        expect(pineappleA?.parent).toBeUndefined();
        expect(box.pineapple).toBe(pineappleB)
    });

    it('remove-pineapple', () => {
        box.removePineapple();
        expect(pineappleB?.parent).toBeUndefined();
        expect(box.pineapple).toBeUndefined()
    });

    it('add-apple', () => {
        expect(redApple.parent).toBeUndefined();
        box.addApple(redApple);
        expect(redApple.parent).toBe(box);
        expect(box.apples).toContain(redApple);
    })

    it('replace-apple', () => {
        expect(greenApple.parent).toBeUndefined();
        box.replaceApple(0, greenApple);
        expect(greenApple.parent).toBe(box);
        expect(redApple.parent).toBeUndefined();
        expect(box.apples).toContain(greenApple);
        expect(box.apples).not.toContain(redApple);
    })

    it('remove-apple', () => {
        box.removeApple(greenApple);
        expect(greenApple.parent).toBeUndefined();
        expect(box.apples.length).toBe(0);
    })
});