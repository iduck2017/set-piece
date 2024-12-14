import React from "react";
import { ModelComp } from ".";
import { PlayerModel } from "@/model/player";
import { DeckComp } from "./deck";
import { GraveyardComp } from "./graveyard";
import { BoardComp } from "./board";
import { HandComp } from "./hand";
import { useModel } from "./use-model";

export function PlayerComp(props: {
    model: PlayerModel
}) {
    const model = useModel(props.model);

    return <ModelComp
        model={props.model}
        form={
            <>
                <div className="link" onClick={model.refresh}>refresh</div>
            </>
        }
        menu={
            <>
                {props.model.childDict.hand && <HandComp model={props.model.childDict.hand} />}
                {props.model.childDict.deck && <DeckComp model={props.model.childDict.deck} />}
                {props.model.childDict.board && <BoardComp model={props.model.childDict.board} />}
                {props.model.childDict.graveyard && 
                    <GraveyardComp model={props.model.childDict.graveyard} />}
            </>
        }
    />;
}
