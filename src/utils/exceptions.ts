import { BaseRecord } from "../types/base";
import { ExceptionId } from "../types/exception";

export class Exception extends Error {
    public exceptionId: ExceptionId;
    public data: BaseRecord;

    constructor(config?: {
        exceptionId?: ExceptionId,
        message?: string,
        data?: BaseRecord
    }) {
        super(config?.message || 'Unknown error.');
        this.exceptionId = config?.exceptionId || ExceptionId.BASE;
        this.data = config?.data || {};
    }   
}