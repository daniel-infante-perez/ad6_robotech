
export async function  coreCheck (dados,actionPhase,rollType,name,owner,message) {
    
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

        let cardData ={
             name: name
            ,owner: owner
            ,rollType: game.i18n.localize("ad6_robotech.rollT." + rollType)
            ,actionPhase: game.i18n.localize("ad6_robotech.phase." +actionPhase)
            ,message: message
            ,dice: roll.dice
            ,successes: successes

        };
        ChatMessage.create({
            speaker: ChatMessage.getSpeaker(),
            content: await renderTemplate("systems/ad6_robotech/templates/cards/roll-card.hbs",cardData)
            });
  
        /*if(this.type=="equipmentsuite")
        {
            this.usar();
        }*/
};