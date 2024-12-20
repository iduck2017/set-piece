import React from "react";
import { ModelComp } from ".";
import { DeckComp } from "./deck";
import { BoardComp } from "./board";
import { HandComp } from "./hand";
import { useModel } from "./use-model";
import { PlayerModel } from "../models/player";
import { State } from "./common";

export function PlayerComp(props: {
    model: PlayerModel
}) {
    const model = useModel(props.model);

    return <ModelComp
        model={props.model}
        form={
            <>
                <div className="link" onClick={model.refresh}>refresh</div>
                <State model={model.childDict.combatable} />
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
