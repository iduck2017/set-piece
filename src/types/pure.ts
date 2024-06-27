import { ModelID } from ".";
import { Model } from "../models/base";
import { IDictTemplate } from "./dict";

type PureDictTemplate = IDictTemplate<{
    id: ModelID.DICT,
    children: T
}>