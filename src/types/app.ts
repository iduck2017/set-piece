type PerferenceData = {
    fullscreen: boolean;
    mute: boolean;
}

type SlotData = {
    slotID: number;
    name: string;
    progress: number;
}

type MetaData = {
    version: string;
    slots: SlotData[];
    perference: PerferenceData;
}

export { 
    MetaData,
    PerferenceData,
    SlotData
};