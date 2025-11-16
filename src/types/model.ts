import { Model } from "../model"

export type Frame<M extends Model> = {
    state: M['state']
    child: M['child']
    refer: M['refer'],
    route: M['route']
}
