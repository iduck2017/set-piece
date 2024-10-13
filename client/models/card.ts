import { SpecModelDef } from "../configs/model-def";
import { ModelCode } from "../configs/model-code";
import { SpecModel } from "./specific";

export type CardModelDef = SpecModelDef<{
    code: ModelCode.Card,
}>


export class CardModel extends SpecModel<CardModelDef> {
    protected _reactDict = {};

}