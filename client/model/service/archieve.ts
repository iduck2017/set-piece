import { Service } from ".";
import { IModel } from "..";
import { Document } from "./document";
import { RawModelDefine } from "../../type/define";
import { Base } from "../../type/base";
import { Game } from "../game";
import { App } from "../app";

export const ARCHIEVE_SAVE_PATH = 'archieve';

export type ArchieveDefine = 
    RawModelDefine<{
        childSet: Document,
        stateMap: {
        },
        referMap: {
            curDocument?: Document,
        }
        type: 'archieve',
    }>


@IModel.useProduct('archieve')
export class Archieve extends IModel<
    ArchieveDefine
> {
    static isLoaded(strict?: boolean) {
        return IModel.useValidator<Document>(
            model => (
                model.parent._rawReferMap.curDocument === model
            ),
            strict  
        );
    }

    constructor(
        config: Archieve['config'],
        parent: Service
    ) {
        super({
            ...config,
            stateMap: {
                ...config.stateMap
            },
            referMap: {
                curDocument: undefined
            },
            childMap: {}
        }, parent);
    }
    
    @IModel.useDebugger()
    @IModel.useValidator(model => Boolean(model._rawReferMap.curDocument))
    async save() {
        const record = Game.main.config;
        const curDocument = this._rawReferMap.curDocument;
        if (curDocument) {
            const savePath = curDocument.curStateMap.savePath;
            await localStorage.setItem(
                savePath, 
                JSON.stringify(record)
            );
            await Service.main.save();
        }
    }

    start(document: Document) {
        this._rawReferMap.curDocument = document;
    }

    @IModel.useDebugger()
    @IModel.useValidator(model => Boolean(model._rawReferMap.curDocument))
    async quit() {
        if (this._rawReferMap.curDocument) {
            this._rawReferMap.curDocument = undefined;
            App.main.quit();
        }
    }

    remove(document: Document) {
        const index = this._childSet.indexOf(document);
        console.log('remove', index);
        if (index >= 0) {
            this._childSet.splice(index, 1);
        }
    }

    @IModel.useDebugger()
    async add() {
        const document: Document = this._new({
            type: 'document',
            stateMap: {
                name: 'New World',
                time: 0,
                animalCnt: 0
            }
        });
        this._childSet.push(document);
        
        const gameConfig: Game['config'] = {
            type: 'game'
        };
        await localStorage.setItem(
            document.curStateMap.savePath, 
            JSON.stringify(gameConfig)
        );
        await Service.main.save();
    }
}