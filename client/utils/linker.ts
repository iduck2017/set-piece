import type { App } from "../app";
import { LinkerType } from "../type/linker";
import { Entity } from "./entity";


/** 链接器 */
export class Linker<
    T extends Linker = any, 
    P = any
> extends Entity {
    public readonly id: string;
    public readonly parent: P;
    
    private readonly $linkerList: Array<T> = [];
    public get linkerList() { return [ ...this.$linkerList ]; }

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
        if (this.$linkerList.includes(target)) {
            throw new Error();
        }
        this.$linkerList.push(target);
    }

    public removeCursor(target: T) {
        const index = this.$linkerList.indexOf(target);
        if (index === -1) {
            throw new Error();
        }
        this.$linkerList.splice(index, 1);
    }
    
    public serialize(): LinkerType.Chunk {
        return {
            id: this.id, 
            list: this.linkerList.map(item => {
                return item.id;
            }) 
        };
    }
}