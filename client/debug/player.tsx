import React from "react";
import { Game } from "@/model/game";
import { ModelComp } from "./model";
import { useModel } from "./useModel";
import { Player } from "@/model/player";
import { MinionComp } from "./minion";
import { MinionCard } from "@/model/card";

export function PlayerComp(props: {
    model: Player,
    setTarget: (model: MinionCard) => void,
}) {
    const { model, setTarget } = props;
    const [ state, child ] = useModel(model);

    return <div className="sider">
        <ModelComp 
            model={model}
        >
            <div className="link" onClick={() => model.summon()}>summon</div>
        </ModelComp>
        <div className="menu">
            {child.desk.map(card => <MinionComp 
                model={card} 
                setTarget={setTarget}
            />)}
        </div>
    </div>;
}