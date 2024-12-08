import React from "react";
import { useModel } from "./use-model";
import { ModelComp } from ".";
import './index.css';
import { Team } from "@/model.bk/team";
import { CardComp } from "./card";
import { Link } from "./common";

export function TeamComp(props: {
    team: Team
}) {
    const { team: team } = props;
    const [ state, child ] = useModel(team);

    return <ModelComp 
        model={team}
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

