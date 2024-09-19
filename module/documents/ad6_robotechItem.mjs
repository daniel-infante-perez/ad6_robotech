export default class ad6_robotechItem extends Item{
    chatTemplate={
         "talent": "systems/ad6_robotech/templates/cards/talent-card.hbs"
        ,"gear": "systems/ad6_robotech/templates/cards/gear-card.hbs"
        ,"equipmentsuite": "systems/ad6_robotech/templates/cards/equipmentsuite-card.hbs"
        ,"skill":"systems/ad6_robotech/templates/cards/skill-card.hbs"
    }
    isDefinedLocalization(localization_string)
    {
        let translated = game.i18n.localize(localization_string);
        
        return (!(translated===undefined)&&!(translated===null)&&!(translated===""));
    }
    prepareData() {
        super.prepareData();
        let cad = "systems/ad6_robotech/assets/"+this.type+".svg";
        
        this.img = cad;
        
        
        this.name = (this.isDefinedLocalization(this.system.intname)?game.i18n.localize(this.system.intname):this.name);
        this.update({"name":this.name});
        this.system.description = (this.isDefinedLocalization(this.system.intdesc)?game.i18n.localize(this.system.intdesc):this.system.description);
        this.update({"system.description":this.system.description});
        if(!(this.system.benefit===undefined)&&!(this.system.benefit===null))
        {
            this.system.benefit = (this.isDefinedLocalization(this.system.intcad1)?game.i18n.localize(this.system.intcad1):this.system.benefit);
            this.update({"system.benefit":this.system.benefit});
        }
        if(!(this.system.cost===undefined)&&!(this.system.cost===null))
        {
            this.system.cost = (this.isDefinedLocalization(this.system.intcad2)?game.i18n.localize(this.system.intcad2):this.system.cost);
            this.update({"system.cost":this.system.cost});
        }

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