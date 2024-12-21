import React, { useContext } from "react";
import { ModelComp } from ".";
import { DeckComp } from "./deck";
import { BoardComp } from "./board";
import { HandComp } from "./hand";
import { useModel } from "./use-model";
import { PlayerModel } from "../models/player";
import { State } from "./common";
import { GameContext } from "./use-context";

export function PlayerComp(props: {
    model: PlayerModel
}) {
    const model = useModel(props.model);
    useModel(model.childDict.combative);
    const { 
        handleTargetCollect,
        isTargetCollectable
    } = useContext(GameContext);
    const enableSelect = isTargetCollectable(props.model);

    return <ModelComp
        model={props.model}
        form={
            <>
                {enableSelect && 
                    <div 
                        className="link mark"
                        onClick={() => handleTargetCollect(props.model)}    
                    >
                        select
                    </div>
                }
                <div className="link" onClick={model.refresh}>refresh</div>
                <State model={model.childDict.combative} />
            </>
        }
        menu={
            <>
                {model.childDict.hand && <HandComp model={model.childDict.hand} />}
                {model.childDict.deck && <DeckComp model={model.childDict.deck} />}
                {model.childDict.board && <BoardComp model={model.childDict.board} />}
            </>
        }
    />;
}
