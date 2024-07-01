import { BaseData } from "../types/base";

class Exception<
    I extends number,
    D extends BaseData,
> extends Error {
    public exceptionId: I;
    public data: D;

    constructor(config: {
        exceptionId: I,
        message: string,
        data: D
    }) {
        super(config.message);
        this.exceptionId = config.exceptionId; 
        this.data = config.data;
    }  
}

export { Exception };