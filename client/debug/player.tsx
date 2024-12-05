import React from "react";
import { useModel } from "./use-model";
import { ModelComp } from ".";
import { Player } from "@/model/player";
import './index.css';
import { DeckComp } from "./deck";
import { HandComp } from "./hand";
import { Link } from "./common";
import { TombComp } from "./tomb";
import { TeamComp } from "./team";

export function PlayerComp(props: {
    player: Player
}) {
    const { player } = props;
    const [ state, child ] = useModel(player);

    return <ModelComp 
        model={player}
        form={
            <>
                <Link model={player} action="draw" />
            </>
        }
        menu={
            <>
                <DeckComp deck={child.deck} />
                <HandComp hand={child.hand} />
                <TombComp tomb={child.tomb} />
                <TeamComp team={child.team} />
            </>
        }
    />;
}

