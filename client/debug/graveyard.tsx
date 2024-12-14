import React from "react";
import { ModelComp } from ".";
import { GraveyardModel } from "@/model/graveyard";

export function GraveyardComp(props: {
    model: GraveyardModel
}) {
    return <ModelComp model={props.model} />;
}
