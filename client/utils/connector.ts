import type { App } from "../app";
import { IConnector } from "../type/connector";
import { Entity } from "./entity";

/** 链接器 */
export class Connector<
    T extends Connector = any, 
    P = any
> extends Entity {
    public readonly id: string;
    public readonly parent: P;
    
    private readonly $connectorList: Array<T> = [];
    public get connectorList() { return [ ...this.$connectorList ]; }

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
    public addConnector(target: T) {
        if (this.$connectorList.includes(target)) {
            throw new Error();
        }
        this.$connectorList.push(target);
    }

    public removeConnector(target: T) {
        const index = this.$connectorList.indexOf(target);
        if (index === -1) {
            throw new Error();
        }
        this.$connectorList.splice(index, 1);
    }
    
    public serialize(): IConnector.Chunk {
        return {
            id: this.id, 
            idList: this.connectorList.map(item => {
                return item.id;
            }) 
        };
    }
}