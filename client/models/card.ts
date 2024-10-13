import { SpecModelDef } from "../type/model-def";
import { ModelCode } from "../type/model-code";
import { SpecModel } from "./specific";

export type CardModelDef = SpecModelDef<{
    code: ModelCode.Card,
}>


export class CardModel extends SpecModel<CardModelDef> {
    protected _reactDict = {};

}