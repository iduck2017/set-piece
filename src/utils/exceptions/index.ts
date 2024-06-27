import { BaseRecord } from "../../types/base";
import { ExceptionID } from "../../types/exception";

export class Exception extends Error {
    public exceptionID: ExceptionID;
    public data: BaseRecord;

    constructor(config?: {
        exceptionID?: ExceptionID,
        message?: string,
        data?: BaseRecord
    }) {
        super(config?.message || 'Unknown error.');
        this.exceptionID = config?.exceptionID || ExceptionID.BASE;
        this.data = config?.data || {};
    }   
}