import React from "react";
import { useModel } from "./use-model";
import { ModelComp } from ".";
import './index.css';
import { Tomb } from "@/model.bk/tomb";
import { CardComp } from "./card";
import { Link } from "./common";

export function TombComp(props: {
    tomb: Tomb
}) {
    const { tomb } = props;
    const [ state, child ] = useModel(tomb);

    return <ModelComp 
        model={tomb}
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

