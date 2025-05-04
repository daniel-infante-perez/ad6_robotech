
import { broadcastToAll } from './ad6_robotech.mjs'; // o ruta donde esté el helper
import { renderAssistOverlay } from './ad6_assist_pool.mjs';
//import { createAssistForActor } from './ad6_assist_pool.mjs';



export async function  coreCheck (dados,actionPhase,rollType,name,owner,message) {
   /* console.log("dados:"+dados);
    console.log("actionPhase:"+actionPhase);
    console.log("rollType:"+rollType);
    console.log("name:"+name);
    console.log("owner:"+owner);
    console.log("message:"+message);*/
    
    if(dados!=0)
    {
        let rollFormula = "{";
        for(let i=0; i < dados; i++)
        {
            if(i!=0){rollFormula+=",";}
            rollFormula+="1d6";
        }
            rollFormula +="}";
            let roll = new Roll(rollFormula);
            await roll.evaluate();
            let successes =0;
            for(let i=0; i < dados; i++)
            {
                if(roll.dice[i].total == 6)
                {
                    if(rollType=="disadvantage"){ successes++;}else{successes+=2;}

                }
                if(roll.dice[i].total == 5)
                    {
                        if((rollType=="edge")||(rollType=="normal")){ successes++;}
                        if(rollType=="advantage"){ successes+=2;}                        
                }
                if(roll.dice[i].total==4)
                {
                    if((rollType=="edge")||(rollType=="advantage")){ successes++;}
                }                
            }
            // Emitir pool de ASSIST si corresponde
            console.log(actionPhase);
            if (actionPhase === "assist") {

                const actor = game.user.character || canvas.tokens.controlled[0]?.actor;
                const assistValue = successes;
                const actorId = actor.id;
              
                game.ad6_assistPools[actorId] = assistValue;
              
                if (!document.querySelector(`.assist-overlay[data-actor-id="${actorId}"]`)) {
                  renderAssistOverlay(actorId, assistValue);
                }
              
                ChatMessage.create({
                  content: "", // silencioso
                  whisper: game.users.contents.map(u => u.id), // a todos
                  flags: {
                    ad6_robotech: {
                      assistSync: true,
                      actorId,
                      assistValue
                    }
                  }
                });
                  
                  
               /* const actor = game.user.character || canvas.tokens.controlled[0]?.actor;
                const assistValue = successes;  // O el valor que determines como cantidad de éxitos asistidos
                const actorId = actor.id;
                
                
                //createAssistForActor(actorId, assistValue);
               
                game.ad6_assistPools[actorId] = assistValue;
              
                // Opcional: forzar render si no se hace vía updateActor
                if (!document.querySelector(`.assist-overlay[data-actor-id="${actorId}"]`)) {
                  renderAssistOverlay(actorId, assistValue);
                }
              
                // También puedes actualizar el actor si aún usas los flags (gatilla updateActor)
                await actor.update({ "flags.ad6_robotech.assistValue": assistValue });
                
                // También puedes actualizar el actor si aún usas los flags (gatilla updateActor)
                await actor.update({ "flags.ad6_robotech.assistValue": assistValue });

                */
              }

            let cardData ={
                name: name
                ,owner: owner
                ,rollType: game.i18n.localize("ad6_robotech.rollT." + rollType)
                ,actionPhase: (actionPhase==""?"":game.i18n.localize("ad6_robotech.phase." +actionPhase))
                ,message: message
                ,dice: roll.dice
                ,successes: successes

            };
            ChatMessage.create({
                speaker: ChatMessage.getSpeaker(),
                content: await renderTemplate("systems/ad6_robotech/templates/cards/roll-card.hbs",cardData),
                flags: {
                    "ad6_robotech": {
                      successes: successes
                    }}
                });
    
            /*if(this.type=="equipmentsuite")
            {
                this.usar();
            }*/
    }
    else
    {
        let cardData ={
            name: name
            ,owner: owner
            ,rollType: game.i18n.localize("ad6_robotech.rollT." + rollType)
            ,actionPhase: (actionPhase==""?"":game.i18n.localize("ad6_robotech.phase." +actionPhase))
            ,message: message
            ,dice: 0
            ,successes: 0

        };
        ChatMessage.create({
            speaker: ChatMessage.getSpeaker(),
            content: await renderTemplate("systems/ad6_robotech/templates/cards/roll-card.hbs",cardData)
            });

    }
};