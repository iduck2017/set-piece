import React, { ReactNode, useEffect, useState } from "react";
import type { App } from "../app";
import type { Model } from "../models";
import "./index.css";
import { ModelType } from "../type/model";
import { EventDict, ModifyEventDict, UpdateEventDict } from "../utils/event";
import { ModelDef } from "../type/model-def";
import { ReactDict } from "../utils/react";
import { Base } from "../type";

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

export type StateVisibleDict = {
    model: boolean;
    api: boolean;
    info: boolean;
    child: boolean;
    event: boolean;
    react: boolean;
}

const FolderComp = (props: {
    title: keyof StateVisibleDict;
    length: number;
    visibleDict: StateVisibleDict,
    setVisibleDict: React.Dispatch<React.SetStateAction<StateVisibleDict>>
    children?: ReactNode[];
}) => {
    const {
        title,
        length,
        visibleDict: visible,
        children,
        setVisibleDict: setVisible
    } = props;

    if (!length) return null;

    return <>
        <div className={`row ${visible[title] ? '' : 'fold'}`}>
            <div className="title key">{title}</div>
            <div className="value">{length}</div>
            <div 
                className="icon" 
                onClick={() => {
                    setVisible(prev => ({
                        ...prev,
                        [title]: !prev[title]
                    }));
                }}
            >
                {visible[title] ? '▲' : '▼'}
            </div>
        </div>
        {visible[title] && children}
    </>;
};

export function ModelComp<
    M extends ModelDef
>(props: ModelProps<M>) {
    const { model, app } = props;
    const [ state, setState ] = useState<ModelState<M>>(model._getState);
    const [ childVisible, setChildVisible ] = useState(true);
    const [ stateVisibleDict, setStateVisibleDict ] = useState<StateVisibleDict>({
        model: true,
        api: true,
        info: true,
        child: false,
        event: false,
        react: false
    });

    useEffect(() => {
        setState(model._getState());
        return model._useState(setState);
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
                <div 
                    className={`head ${childVisible ? '' : 'fold'}`}
                    onClick={() => {
                        setChildVisible(!childVisible);
                    }}
                >
                    {model.code}
                </div>
                <div className="row">
                    <div className="title key">id</div>
                    <div className="value">{model.id}</div>
                </div>
                <FolderComp 
                    visibleDict={stateVisibleDict}
                    setVisibleDict={setStateVisibleDict}
                    title="info"
                    length={Object.keys(info).length}
                >
                    {Object.keys(info).map(key => (
                        <div className="row" key={key}>
                            <div className="key link">{key}</div>
                            <div className="value">{info[key]}</div>
                        </div>
                    ))}
                </FolderComp>
                <FolderComp
                    visibleDict={stateVisibleDict}
                    setVisibleDict={setStateVisibleDict}
                    title="api"
                    length={Object.keys(model.apiDict).length}
                >
                    {Object.keys(model.apiDict).map(key => (
                        <div className="row" key={key}>
                            <div 
                                className="key link"
                                onClick={() => {
                                    model.apiDict[key].call(model);
                                }}
                            >
                                {key}
                            </div>
                        </div>
                    ))}
                </FolderComp>
                <FolderComp
                    visibleDict={stateVisibleDict}
                    setVisibleDict={setStateVisibleDict}
                    title="child"
                    length={Object.keys(childDict).length + childList.length}
                >
                    {Object.keys(childDict).map(key => (
                        <div 
                            className='row'
                            key={key}
                        >
                            <div className="key ">{key}</div>
                        </div>
                    ))}
                    {childList.map((item, index) => (
                        <div 
                            className='row' 
                            key={index}
                        >
                            <div className="key">iterator_{index}</div>
                        </div>
                    ))}
                </FolderComp>
                <FolderComp
                    visibleDict={stateVisibleDict}
                    setVisibleDict={setStateVisibleDict}
                    title="event"
                    length={Object.keys(eventDict).length}
                >
                    {Object.keys(eventDict).map(key => (
                        <div className="row" key={key}>
                            <div className="key link">{key}</div>
                        </div>
                    ))}
                </FolderComp>
                <FolderComp
                    visibleDict={stateVisibleDict}
                    setVisibleDict={setStateVisibleDict}
                    title="react"
                    length={Object.keys(reactDict).length}
                >
                    {Object.keys(reactDict).map(key => (
                        <div className="row" key={key}>
                            <div className="key link">{key}</div>
                        </div>
                    ))}
                </FolderComp>
            </div>
            {childVisible && <div className="children">
                {childList
                    .map(item => (
                        <ModelComp 
                            key={item.id}
                            model={item}
                            app={app}
                        />
                    ))
                }
                {Object.values(childDict).map(item => (
                    <ModelComp 
                        key={item.id}
                        model={item}
                        app={app}
                    />
                ))
                }
            </div>}
        </div>
    );
}

