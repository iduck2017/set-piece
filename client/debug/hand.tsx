import React from "react";
import { useModel } from "./use-model";
import { ModelComp } from ".";
import './index.css';
import { Hand } from "@/model.bk/hand";
import { CardComp } from "./card";
import { Link } from "./common";

export function HandComp(props: {
    hand: Hand
}) {
    const { hand } = props;
    const [ state, child ] = useModel(hand);

    return <ModelComp 
        model={hand}
        form={
            <>
            </>
        }
        menu={
            <>
                {child.map(item => (<CardComp key={item.uuid} card={item} />))}
            </>
        }
    />;
}

