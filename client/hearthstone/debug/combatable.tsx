import React, { useContext } from "react";
import { Link } from "@/demo/debug/common";
import { ModelComp } from ".";
import { CombatableModel } from "../models/combatable";
import { useModel } from "@/demo/debug/use-model";
import { GameContext } from "./use-context";

export function CombatableComp(props: {
    model: CombatableModel
}) {
    useModel(props.model);
    const { 
        setTargetCollectorInfo,
        targetCollector
    } = useContext(GameContext);

    return <ModelComp
        model={props.model}
        form={
            <>
                {!targetCollector && 
                    <Link 
                        model={props.model} 
                        action='willAttack' 
                        then={(result) => {
                            if (!result) return;
                            setTargetCollectorInfo(result);
                        }}
                    />
                }
            </>
        }
    />;
}

