import React from "react";
import { Game } from "@/model/game";
import { ModelComp } from "./model";
import { useModel } from "./useModel";
import { PlayerComp } from "./player";
import { Card, MinionCard } from "@/model/card";

export function MinionComp(props: {
    model: MinionCard,
    setTarget: (card: MinionCard) => void,
}) {
    const { model, setTarget } = props;
    const [ state, child ] = useModel(model.child.minion);

    return <div className="sider">
        <ModelComp 
            model={model}
        >
            <div>attack: {state.curAttack}/{state.rawAttack}</div>
            <div>health: {state.curHealth}/{state.maxHealth}</div>
            <div className="link" onClick={() => setTarget(model)}>setTarget</div>
        </ModelComp>
        <div className="menu">
        </div>
    </div>;
}