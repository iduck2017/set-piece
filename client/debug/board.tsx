import React from "react";
import { ModelComp } from ".";
import { BoardModel } from "@/model/board";

export function BoardComp(props: {
    model: BoardModel
}) {
    return <ModelComp model={props.model} />;
}

