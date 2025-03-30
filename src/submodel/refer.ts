import { Model } from "@/model/model";
import { SubModel } from ".";

export class ReferModel<
    R1 extends Record<string, Model>,
    R2 extends Record<string, Model>
> extends SubModel {
    
}