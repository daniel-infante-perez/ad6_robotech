export default class ad6_robotechItem extends Item{
    chatTemplate={
         "talent": "systems/ad6_robotech/templates/cards/talent-card.hbs"
        ,"gear": "systems/ad6_robotech/templates/cards/gear-card.hbs"
        ,"equipmentsuite": "systems/ad6_robotech/templates/cards/equipmentsuite-card.hbs"
        ,"skill":"systems/ad6_robotech/templates/cards/skill-card.hbs"
    }
    
    prepareData() {
        super.prepareData();
        let cad = "systems/ad6_robotech/assets/"+this.type+".svg";
        //console.log(cad);
        this.img = cad;
    }

    message()
    {
        let res = "";
        if(this.type=="skill")
        {
            res = "(" + this.benefit + " / " + this.cost + ")";            
        }
        return res;
    }

    canRoll()
    {
        
        let res = true;
        if((this.type=="skill")||(this.type=="gear"))
        {
            res = true;
        }
        else
        {
            res = this.consumable();
        }
        return res;

    }
    consumable()
    {
        let res = true;
       /* console.log("1:" + this.system.max +"<");
        console.log("2:" + (this.system.max===undefined));
        console.log("3:" + (this.system.max==" "));
        console.log("4:" + (this.system.max==null));
        console.log("5:" + (this.system.max===null));*/

        if((this.type=="equipmentsuite")||(this.type=="talent"))
        {
            
            if ((this.system.max===undefined))
            {
                res =  false;
            }
            else
            {
                res = ((this.system.value > 0)||((this.system.max=="")&&(this.system.value=="")));
            }
        }
        else { res =  false; }

        return res;
   }
 
    async refresh()
    {
        let nuevo = this.system.max;
        this.update({ 'system.value': nuevo });
    }

    async consume()
    {
        let nuevo = this.system.value-1;
        if(!((this.system.max=="")&&(this.system.value=="")))
        this.update({ 'system.value': nuevo });

    }
    async describe (verbose)
    {
        
        let cardData ={
            name: this.name
           ,description: this.system.description
           ,owner: this.parent.name
           ,verbose: verbose
       };

        ChatMessage.create({
            speaker: ChatMessage.getSpeaker(),
            content: await renderTemplate("systems/ad6_robotech/templates/cards/description-card.hbs",cardData)
            });
    }
}