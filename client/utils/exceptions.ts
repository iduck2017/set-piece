import { BaseRecord } from "../types/base";

export class Ex<
    I extends number,
    D extends BaseRecord,
> extends Error {
    public exceptionId: I;
    public data       : D;

    constructor(config: {
        exceptionId: I,
        message    : string,
        data       : D
    }) {
        super(config.message);
        this.exceptionId = config.exceptionId; 
        this.data = config.data;
    }  
}
