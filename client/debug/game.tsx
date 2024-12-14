import React from "react";
import { ModelComp } from ".";
import { GameModel } from "@/model/game";
import { PlayerComp } from "./player";

export function GameComp(props: {
    model: GameModel
}) {
    const { model } = props;

    return <ModelComp
        model={model}
        form={
            <>
            </>
        }
        menu={
            <>
                {model.childDict.redPlayer && <PlayerComp model={model.childDict.redPlayer} />}
                {model.childDict.bluePlayer && <PlayerComp model={model.childDict.bluePlayer} />}
            </>
        }
    />;
}

