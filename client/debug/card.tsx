import React from "react";
import { useModel } from "./use-model";
import { ModelComp, StateForm } from ".";
import './index.css';
import { ICard } from "@/model/card";
import { IMinion } from "@/model/minion";
import { Link } from "./common";

export function CardComp(props: {
    card: ICard
}) {
    const { card } = props;
    const [ state, child ] = useModel(card);

    return <ModelComp 
        model={card}
        form={
            <>
                {child.minion && <StateForm model={child.minion} />}
                {card.child.minion && <Link model={card.child.minion} action="play" />}
                {card.child.minion && <Link model={card.child.minion} action="attack" />}
            </>
        }
        menu={
            <>
                
            </>
        }
    />;
}


