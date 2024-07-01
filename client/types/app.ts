type SlotData = {
    slotId: string;
    name: string;
    progress: number;
}

type SettingData = {
    fullscreen: boolean;
    mute: boolean;
}

type MetaData = {
    version: string;
    slots: SlotData[];
    perference: SettingData;
}

export { 
    MetaData,
    SlotData,
    SettingData
};