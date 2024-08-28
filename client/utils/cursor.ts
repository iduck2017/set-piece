import type { App } from "../app";
import { CursorType } from "../type/cursor";
import { Entity } from "./entity";


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

    /** 添加链接器 */
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

    public serialize(): CursorType.Chunk {
        return {
            id: this.id, 
            list: this.cursorList.map(item => {
                return item.id;
            }) 
        };
    }
}