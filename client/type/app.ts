export namespace AppInfo {
    export type MetaData = {
        version: string
        settings: Settings
        archieves: Archieve[]
    }

    export type Settings = {
        fullscreen: boolean
        mute: boolean
    }

    export type Archieve = {
        id: string
        name: string,
        progress: number
    }
}