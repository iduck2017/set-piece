import { IModel } from ".";
import { Factory } from "@/service/factory";
import { ChunkOf } from "@/type/model";
import { App } from "./app";
import { Gender } from "@/type/common";
import { Random } from "@/util/random";
import { Validator } from "@/service/validator";
import { Logger } from "@/service/logger";


@Factory.useProduct('bunny')
export class Bunny extends IModel<
    'bunny',
    {
        age: number;
        gender: Gender
    },
    Bunny[],
    {}
> {
    declare parent: Bunny | App;

    constructor(
        chunk: ChunkOf<Bunny>,
        parent: Bunny | App
    ) {
        super({
            child: [],
            ...chunk,
            state: {
                age: 0,
                gender: Random.type(Gender),
                ...chunk.state
            }
        }, parent);
    }

    @Logger.useDebug(true)
    @Validator.useCondition(bunny => bunny.state.gender === Gender.Female)
    reproduce() {
        this._child.push({
            code: "bunny"
        });
    }

    growup() {
        this._state.age += 1;
    }
}

