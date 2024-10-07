import React, { ReactNode, useEffect, useState } from "react";
import type { App } from "../app";
import type { Model } from "../models";
import "./index.css";
import { ModelType } from "../type/model";
import { EventDict, ModifyEventDict, UpdateEventDict } from "../utils/event";
import { ModelDef } from "../type/model-def";
import { ReactDict } from "../utils/react";

export type ModelProps<M extends ModelDef> = {
    model: Model<M>,
    app: App
}

export type ModelState<M extends ModelDef> = {
    childList: ModelType.ChildList<M>,
    childDict: ModelType.ChildDict<M>,
    eventDict: EventDict<M>,
    updateEventDict: UpdateEventDict<M>,
    modifyEventDict: ModifyEventDict<M>,
    reactDict: ReactDict<M>,
    info: ModelDef.Info<M>
}

export type VisibleState = {
    model: boolean;
    api: boolean;
    info: boolean;
    child: boolean;
    event: boolean;
    react: boolean;
}

const FolderComp = (props: {
    formKey: keyof VisibleState;
    visible: VisibleState,
    setVisible?: React.Dispatch<React.SetStateAction<VisibleState>>
    children?: ReactNode[];
}) => {
    const {
        formKey,
        visible,
        children,
        setVisible
    } = props;

    return <>
        <div 
            className={`row ${visible[formKey] ? '' : 'fold'}`}
            onClick={() => {
                setVisible?.(prev => ({
                    ...prev,
                    [formKey]: !prev[formKey]
                }));
            }}
        >
            <div className="field">{formKey}</div>
        </div>
        {visible[formKey] && children}
    </>;
};

export function ModelComp<
    M extends ModelDef
>(props: ModelProps<M>) {
    const { model, app } = props;
    const [ state, setState ] = useState<ModelState<M>>(model.getState);
    const [ visible, setVisible ] = useState<VisibleState>({
        model: true,
        api: true,
        info: true,
        child: false,
        event: false,
        react: false
    });

    useEffect(() => {
        setState(model.getState());
        return model.useState(setState);
    }, [ model ]);

    const {
        childDict,
        childList,
        eventDict,
        reactDict,
        info
    } = state;

    return (
        <div className="model" id={model.id}>
            <div className="data">
                <div className="title">{model.code}</div>
                <div className="row">
                    <div className="field">id</div>
                    <div className="value">{model.id}</div>
                </div>
                <FolderComp 
                    visible={visible}
                    setVisible={setVisible}
                    formKey="info"
                >
                    {Object.keys(info).map(key => (
                        <div className="row" key={key}>
                            <div className="key">{key}</div>
                            <div className="value">{info[key]}</div>
                        </div>
                    ))}
                </FolderComp>
                <div className="row">
                    <div className="field">API</div>
                    <div className="value">
                        <div className="function">open</div>
                        <div className="function">fold</div>
                    </div>
                </div>
                {Object.keys(model.apiDict).map(key => (
                    <div className="row" key={key}>
                        <div className="key">{key}</div>
                        <div 
                            className="function"
                            onClick={() => {
                                model.apiDict[key].call(model);
                            }}
                        >
                            call
                        </div>
                    </div>
                ))}
                <div className="row">
                    <div className="field">Child</div>
                    <div className="value">
                        <div className="function">open</div>
                        <div className="function">fold</div>
                    </div>
                </div>
                {Object.keys(childDict).map(key => (
                    <div className="row" key={key}>
                        <div className="key">{key}</div>
                        <div className="function">check</div>
                    </div>
                ))}
                {childList.map((item, index) => (
                    <div className="row" key={index}>
                        <div className="key">iterator[{index}]</div>
                        <div className="function">check</div>
                    </div>
                ))}
                <div className="row">
                    <div className="field">EventDict</div>
                    <div className="value">
                        <div className="function">open</div>
                        <div className="function">fold</div>
                    </div>
                </div>
                {Object.keys(eventDict).map(key => (
                    <div className="row" key={key}>
                        <div className="key">{key}</div>
                        <div className="function">check</div>
                    </div>
                ))}
                <div className="row">
                    <div className="field">ReactDict</div>
                    <div className="value">
                        <div className="function">open</div>
                        <div className="function">fold</div>
                    </div>
                </div>
                {Object.keys(reactDict).map(key => (
                    <div className="row" key={key}>
                        <div className="key">{key}</div>
                        <div className="function">check</div>
                    </div>
                ))}
            </div>
            <div className="children">
                {childList.map(item => (
                    <ModelComp 
                        key={item.id}
                        model={item as any}
                        app={app}
                    />
                ))}
                {Object.values(childDict).map(item => (
                    <ModelComp 
                        key={item.id}
                        model={item as any}
                        app={app}
                    />
                ))}
            </div>
        </div>
    );
}

