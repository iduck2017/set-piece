import React from "react";
import { ModelComp } from ".";
import { PlayerComp } from "./player";
import { Link } from "./common";
import { GameProvider, useContext } from "./use-context";
import { GameModel } from "../models/game";

function RawGameComp(props: {
    model: GameModel
}) {
    const { model } = props;
    const { targetCollector } = useContext();

    return (
        <ModelComp
            model={model}
            form={
                <>
                    <Link model={model} action="checkDatabase" />
                    <Link model={model} action="nextRound" />
                    {targetCollector?.hint && <div className="mark">
                        hint: {targetCollector.hint}
                    </div>}
                </>
            }
            menu={
                <>
                    {model.childDict.redPlayer && 
                            <PlayerComp model={model.childDict.redPlayer} />}
                    {model.childDict.bluePlayer && 
                            <PlayerComp model={model.childDict.bluePlayer} />}
                </>
            }
        />
    );
}

export function GameComp(props: {
    model: GameModel
}) {
    return <GameProvider>
        <RawGameComp model={props.model} />
    </GameProvider>;
}

