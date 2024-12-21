import { CustomDef, FactoryService, Props } from "@/set-piece";
import { MinionDef, MinionModel } from "@/hearthstone/models/minion";

export type ArgentSquireDef = MinionDef<
   CustomDef<{
       code: 'argent-squire-minion-card',
   }>
>

@MinionModel.useRule({
   combative: {
       health: 1,
       attack: 1,
       races: []
   },
   castable: {
       manaCost: 1
   },
   divineShield: {
       isActived: true
   }
})
@FactoryService.useProduct('argent-squire-minion-card')
export class ArgentSquireModel extends MinionModel<ArgentSquireDef> {
   constructor(props: Props<ArgentSquireDef>) {
       const superProps = MinionModel.minionProps(props);
       super({
            ...superProps,
            paramDict: {
                name: 'Argent Squire',
                desc: 'Divine Shield',
                flavor: '"I solemnly swear to uphold the Light, purge the world of darkness, and to eat only burritos." - The Argent Dawn Oath'
            },
            stateDict: {},
       });
   }
}