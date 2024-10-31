import { Service } from ".";
import { Model } from "..";
import { Document } from "./document";
import { App } from "../app";
import { RawModelDefine } from "../../type/define";
import { Game } from "../game";

export const ARCHIEVE_SAVE_PATH = 'archieve';

export type ArchieveDefine = 
    RawModelDefine<{
        childSet: Document
        type: 'archieve'
    }>


@Model.useProduct('archieve')
export class Archieve extends Model<
    ArchieveDefine
> {
    constructor(
        config: Archieve['config'],
        parent: Service
    ) {
        console.log(config);
        super({
            ...config,
            stateMap: {},
            childMap: {}
        }, parent);
    }

    private _curDocument?: Document;

    @Model.useDebug()
    async new() {
        const document: Document = this._new({
            type: 'document',
            stateMap: {
                name: 'New World',
                time: 0,
                animalCnt: 0
            }
        });
        this._childSet.push(document);
        await localStorage.setItem(
            document.savePath, 
            JSON.stringify({
                type: 'game'
            })
        );
        await App.service.save();
    }
}