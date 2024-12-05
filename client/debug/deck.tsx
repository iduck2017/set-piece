import React from "react";
import { useModel } from "./use-model";
import { ModelComp } from ".";
import './index.css';
import { Deck } from "@/model/deck";
import { CardComp } from "./card";
import { Link } from "./common";

export function DeckComp(props: {
    deck: Deck
}) {
    const { deck } = props;
    const [ state, child ] = useModel(deck);

    return <ModelComp 
        model={deck}
        form={
            <>
                <Link model={deck} action="append" />
                <Link model={deck} action="shift" />
            </>
        }
        menu={
            <>
                {child.map(item => (<CardComp key={item.uuid} card={item} />))}
            </>
        }
    />;
}

