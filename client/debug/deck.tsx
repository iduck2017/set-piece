import React from "react";
import { ModelComp } from ".";
import { DeckModel } from "@/model/deck";

export function DeckComp(props: {
    model: DeckModel
}) {
    return <ModelComp model={props.model} />;
}
