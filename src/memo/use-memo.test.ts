import { depManager } from "../dep/dep-manager";
import { useDep } from "../dep/use-dep";
import { useEffect } from "../effect/use-effect";
import { useConsoleLog } from "../log/use-console-log";
import { Model } from "../model";
import { tagRegistry } from "../tag/tag-registry";
import { useMemo } from "./use-memo";

class BoxModel extends Model {
    protected _brand = Symbol('box-model');

    private _code?: string
    public get name() {
        if (!this._code) return super.name;
        return `Box${this._code}`;
    }

    constructor(code: string) {
        super();
        this._code = code;
        this.init();
    }

    @useDep()
    private _children: BoxModel[] = [];
    public get children() {
        return [...this._children]
    }

    @useConsoleLog()
    public addChild(box: BoxModel) {
        this._children.push(box);
    }

    @useDep()
    private _size = 10;
    public resize(size: number) {
        this._size = size;
    }

    @useMemo()
    public get totalSize() {
        let result = this._size;
        this._children.forEach(child => {
            result += child.totalSize;
        })
        return result;
    }


    @useEffect()
    private checkDeps() {
        this.totalSize;
        this.children;
    }
}

const boxA = new BoxModel('A');
const boxB = new BoxModel('B');
const boxC = new BoxModel('C');
const boxD = new BoxModel('D');
console.log(boxA.totalSize);

boxA.addChild(boxB);
console.log(boxA.children.length);
console.log(boxA.totalSize);

boxB.addChild(boxC);
console.log(boxC.totalSize)
console.log(boxB.totalSize);
console.log(boxA.totalSize);
// console.log(depManager.query(tagRegistry.query(boxA, 'totalSize')))
// console.log(memoDepManager.query(tagRegistry.query(boxB, 'totalSize')))

boxB.addChild(boxD);
console.log(boxD.totalSize)
console.log(boxB.totalSize);
console.log(boxA.totalSize);