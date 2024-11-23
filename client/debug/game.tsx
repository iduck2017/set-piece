import React, { useState } from "react";
import { Game } from "@/model/game";
import { ModelComp } from "./model";
import { useModel } from "./useModel";
import { PlayerComp } from "./player";
import { MinionCard } from "@/model/card";

export function GameComp(props: {
    model: Game
}) {
    const { model } = props;
    const [ state, child ] = useModel(model);
    const [ target, setTarget ] = useState<MinionCard>();

    return <div className="sider">
        <ModelComp 
            model={model}
        >
            <div>target: {target?.id}</div>
        </ModelComp>
        <div className="menu">
            <PlayerComp 
                model={child.redPlayer} 
                setTarget={setTarget}
            />
            <PlayerComp 
                model={child.bluePlayer} 
                setTarget={setTarget}
            />
        </div>
    </div>;
}