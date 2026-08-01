import { Model } from "../model";
import { useChild } from "../hooks/use-child";
import { childRegistry } from "./child-registry";
import { useMemo } from "../hooks/use-memo";
import { useModel } from "../hooks/use-model";

class AppleModel extends Model {}
class PineappleModel extends Model {}
class BoxModel extends Model {
    @useChild()
    private _pineapple?: PineappleModel = new PineappleModel();
    public get pineapple() { return this._pineapple; }
    public setPineapple(pineapple: PineappleModel) {
        this._pineapple = pineapple;
    }
    public delPineapple() {
        this._pineapple = undefined;
    }

    @useChild()
    private _apples: AppleModel[] = [];
    public get apples() { return [...this._apples]; }
    public addApple(apple: AppleModel) {
        this._apples.push(apple);
    }
    public delApple(apple: AppleModel) {
        this._apples = this._apples.filter(item => item !== apple);
    }
    public setApple(index: number, apple: AppleModel) {
        if (index >= this._apples.length) {
            console.warn('Index out of bounds');
            return;
        }
        this._apples[index] = apple;
    }
}

@useModel('reactive-link-child')
class ReactiveLinkChildModel extends Model {
    @useMemo()
    public get parentMemo() { return this.parent; }

    @useMemo()
    public get rootMemo() { return this.root; }
}

@useModel('reactive-link-parent')
class ReactiveLinkParentModel extends Model {
    @useChild()
    private _child?: ReactiveLinkChildModel;
    public get child() { return this._child; }
    public set child(value: ReactiveLinkChildModel | undefined) { this._child = value; }
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
        const children = box.descendants
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
        box.delPineapple();
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
        box.setApple(0, greenApple);
        expect(greenApple.parent).toBe(box);
        expect(redApple.parent).toBeUndefined();
        expect(box.apples).toContain(greenApple);
        expect(box.apples).not.toContain(redApple);
    })

    it('remove-apple', () => {
        box.delApple(greenApple);
        expect(greenApple.parent).toBeUndefined();
        expect(box.apples.length).toBe(0);
    })

    it('refreshes parent and root memos', () => {
        const parent = new ReactiveLinkParentModel();
        const child = new ReactiveLinkChildModel();

        expect(child.parentMemo).toBeUndefined();
        expect(child.rootMemo).toBe(child);

        parent.child = child;
        expect(child.parentMemo).toBe(parent);
        expect(child.rootMemo).toBe(parent);

        parent.child = undefined;
        expect(child.parentMemo).toBeUndefined();
        expect(child.rootMemo).toBe(child);
    })
});
