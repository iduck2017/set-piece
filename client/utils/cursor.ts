import type { App } from "../app";
import { Entity } from "./entity";

/** 链接器序列化参数 */
export type CursorConfig = {
    id?: string,
    cursorIdList?: string[]
}

/** 链接器 */
export class CurSor<
    T extends CurSor = any, 
    P = any
> extends Entity {
    public readonly id: string;
    public readonly parent: P;
    
    private readonly $cursorList: Array<T> = [];
    public get cursorList() { return [ ...this.$cursorList ]; }

    constructor(
        id: string,
        parent: P,
        app: App
    ) {
        super(app);
        this.id = id;
        this.parent = parent;
    }

    public addCursor(target: T) {
        if (this.$cursorList.includes(target)) {
            throw new Error();
        }
        this.$cursorList.push(target);
    }

    public removeCursor(target: T) {
        const index = this.$cursorList.indexOf(target);
        if (index === -1) {
            throw new Error();
        }
        this.$cursorList.splice(index, 1);
    }
    
    public destroy() { 
        this.$cursorList.forEach(item => {
            item.destroy();
        }); 
    }

    public serialize() {
        return [ 
            this.id, 
            ...this.cursorList.map(item => {
                return item.id;
            }) 
        ];
    }
}