import { coreCheck } from "../ad6_roll.mjs";

export default class ad6_robotechCharacterSheet extends ActorSheet{
    
    static get defaultOptions() {
  
        
        return foundry.utils.mergeObject(super.defaultOptions, {
          classes: ["ad6_robotech", "sheet", "actor"],
          template: "systems/ad6_robotech/templates/sheets/actor/character-main-sheet.hbs",
          width: 890,
          height: 890,                    
          scrollY:[".contents-container"],
          tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "skills" }]
        });
        

    }

    get template(){
        switch(this.actor.type)
        {
            case "main": this.position.height = 890; break;
            case "lieutenant": this.position.height = 550; break;
            case "swarm": this.position.height = 620; break;
            default: this.position.height=890;
        }

        const path = 'systems/ad6_robotech/templates/sheets/actor';
        return path + '/character-' + this.actor.type +'-sheet.hbs';
    }


    getData()
    {
        const data = super.getData();
        data.config = CONFIG.ad6_robotech;

        let principales = game.actors.filter(function(actor){return actor.type=="main"});
        let rooster ={};
        rooster[""]="";
        for (const principal of principales) {
            rooster[principal.id]=principal.name;
            
          }

        data.system = this.actor.system;
        data.rooster = rooster;
        data.gears = this.actor.items.filter(function(item){return item.type=="gear"});
        data.suites = this.actor.items.filter(function(item){return item.type=="equipmentsuite"});
        data.talents = this.actor.items.filter(function(item){return item.type=="talent"});
        data.skills = this.actor.items.filter(function(item){return item.type=="skill"});
        data.features = this.actor.items.filter(function(item){return item.type=="feature"});
        data.hardwares = this.actor.items.filter(function(item){return item.type=="hardware"});

        if((this.actor.type=="vehicle")&&(this.actor.system.pilot!=""))
        {
            let pilot = game.actors.get(this.actor.system.pilot);
            data.talents = pilot.items.filter(function(item){return item.type=="talent"});
            data.skills = pilot.items.filter(function(item){return item.type=="skill"});
        }

        data.type = this.actor.type;

        if(this.actor.type=="vehicle")
        {
            switch(this.actor.system.type)
            {
                case "lieutenant":
                    data.visibleSwDiv ="visibility:hidden;";
                    data.visibleLtDiv = "";
                    data.visibleMnDiv = "visibility:hidden;";
                    data.visibleLt3 ="visibility:hidden;";
                    data.visibleReroll = "visibility:hidden;";
                    break;
                case "main":
                    data.visibleSwDiv ="visibility:hidden;";
                    data.visibleLtDiv = "visibility:hidden;";
                    data.visibleMnDiv = "";
                    data.visibleLt3 ="";
                    data.visibleReroll = "";
                    break;
                case "swarm":
                    data.visibleSwDiv ="";
                    data.visibleLtDiv = "visibility:hidden;";
                    data.visibleMnDiv = "";
                    data.visibleLt3 ="";
                    data.visibleReroll = "visibility:hidden;";
                    break;

            }
           /* if(this.actor.system.type !="lieutenant")
            {
                data.visibleLtDiv = "visibility:hidden;";
                
            }
            if(this.actor.system.type !="swarm")
                {
                    data.visibleSwDiv = "visibility:hidden;";
                    
                }
            if(this.actor.system.type =="lieutenant")
                {
                    data.visibleLt3 = "visibility:hidden;";
                    
                }
    
             */
        }

        data.hex0 = {  field: "system.attack"
                      ,value: data.system.attack
                      ,lbl: "ad6_robotech.phase.attack"
                      ,phase: "attack"
                      ,rollable: ""
        };
        data.hex1 = {  field: "system.defend"
            ,value: data.system.defend
            ,lbl: "ad6_robotech.phase.defend"
            ,phase: "defend"
            ,rollable: ""
        };
        data.hex2 = {  field: "system.redirect"
            ,value: data.system.redirect
            ,lbl: "ad6_robotech.phase.redirect"
            ,phase: "redirect"
            ,rollable: ""
        };
        data.hex3 = {  field: "system.assist"
            ,value: data.system.assist
            ,lbl: "ad6_robotech.phase.assist"
            ,phase: "assist"
            ,rollable: ""
        };
        data.hex4 = {  field: "system.interact"
            ,value: data.system.interact
            ,lbl: "ad6_robotech.phase.interact"
            ,phase: "interact"
            ,rollable: ""
        };
        data.hex5 = {  field: "system.units"
            ,value: data.system.units
            ,lbl: "ad6_robotech.sheetText.units"
            ,phase: ""
            ,rollable: ""
        };

        data.hex6 = {  field: "system.level"
            ,value: data.system.level
            ,lbl: "ad6_robotech.sheetText.level"
            ,phase: ""
            ,rollable: "visibility: hidden;"
        };
        data.hex7 = {  field: "system.buildPoints"
            ,value: data.system.buildPoints
            ,lbl: "ad6_robotech.sheetText.buildPoints"
            ,phase: ""
            ,rollable: "visibility: hidden;"
        };
        data.hex8 = {  field: "system.speed"
            ,value: data.system.speed
            ,lbl: "ad6_robotech.sheetText.speed"
            ,phase: ""
            ,rollable: "visibility: hidden;"
        };                
        
        data.hex9 = {  field: "system.units"
            ,value: data.system.units
            ,lbl: "ad6_robotech.sheetText.units"
            ,phase: ""
            ,rollable: "visibility: hidden;"
        };

        data.hex10 = {  field: "system.dice"
            ,value: data.system.dice
            ,lbl: "ad6_robotech.sheetText.dice"
            ,phase: ""
            ,rollable: ""
        };

        data.hex11 = {  field: "system.totalWounds"
            ,value: data.system.totalWounds
            ,lbl: "ad6_robotech.sheetText.totalWounds"
            ,phase: ""
            ,rollable: "visibility: hidden;"
        };

        data.hex11 = {  field: "system.totalWounds"
            ,value: data.system.totalWounds
            ,lbl: "ad6_robotech.sheetText.totalWounds"
            ,phase: ""
            ,rollable: "visibility: hidden;"
        };
        data.hex13 = {  field: "system.dice"
            ,value: data.system.dice
            ,lbl: "ad6_robotech.sheetText.dice"
            ,phase: ""
            ,rollable: ""
        }; 
        if(this.actor.type=="vehicle"){
        data.hex12 = {  
             value: Math.ceil(data.system.structure.max/3)
            ,lbl: "ad6_robotech.sheetText.redstr"
            ,phase: ""
            ,rollable:  "visibility: hidden;"
            ,rdonly: "readonly"
        };
       
    }
        
        data.flags = this.actor.flags;


        return data;
    }

    activateListeners(html)
    {
        super.activateListeners(html);


        

        html.find(".item-edit").click(this._onItemEdit.bind(this));
        
        html.find(".item-delete").click(this._onItemDelete.bind(this));

            html.find(".item-description").click(this._onItemDescription.bind(this));
            html.find(".item-refresh").click(this._onItemRefresh.bind(this));
            html.find(".item-use").click(this._onItemUse.bind(this));

            //html.find(".core-check").click(this._onCoreCheck.bind(this));
            html.find(".hex-check").click(this._onHexCheck.bind(this));

            html.find(".item-create").click(this._onItemCreate.bind(this));


            html.find(".hardware-status").click(this._onHardwareStatus.bind(this));
            
            html.find(".change").change(this._onTextChange.bind(this));
            // cuando pierde el foco
            //html.find(".blur").blur(this.blur.bind(this));

            html.find(".infinity").click(this._onInfinity.bind(this));

            html.find(".stack").click(this._onStackClick.bind(this));
            html.find(".item-reset").click(this._onResetRoll.bind(this));
            html.find(".item-reroll").click(this._onReroll.bind(this));
            
    }

    _onResetRoll(event)
    {
        event.preventDefault(); 
        this.actor.update({"system.dice":0});
        let suites = this.actor.items.filter(function(item){return item.type=="equipmentsuite"});
        let skills = this.actor.items.filter(function(item){return item.type=="skill"});
        if((this.actor.type=="vehicle")&&(this.actor.system.pilot!=""))
        {
            skills = game.actors.get(this.actor.system.pilot).items.filter(function(item){return item.type=="skill"});
        }

        for (const skill of skills) {
            skill.update({"system.stack":false});
          }
          for (const suite of suites) {
            suite.update({"system.stack":false});
          }

        
    }
    _onInfinity(event)
    {
        event.preventDefault();
        let item = this.getItemOnItemId(event);
        item.update({"system.max":"∞"});
        item.update({"system.value":"∞"});


    }
    _onTextChange(event)
    {
        let item = this.getItemOnItemId(event);
        let element = event.currentTarget;
        let field = element.closest(".item").dataset.field;
        switch(field)
        {
            case "system.max":
                item.update({"system.max":event.target.value}); break;
            case "system.value":
                item.update({"system.value":event.target.value}); break;
            case "system.skill":
                item.update({"system.skill":event.target.value}); break;
            case "system.range":
                item.update({"system.range":event.target.value}); break;
            case "system.ext":
                item.update({"system.ext":event.target.value}); break;
            case "system.damage":
                item.update({"system.damage":event.target.value}); break;
            case "system.pen":
                item.update({"system.pen":event.target.value}); break;
            case "system.aoe":
                item.update({"system.aoe":event.target.value}); break;
            case "system.benefit":
                item.update({"system.benefit":event.target.value}); break;
            case "system.cost":
                item.update({"system.cost":event.target.value}); break;
            case "name":
                item.update({"name":event.target.value});  
                break; 
        }


    }

    _onStackClick(event)
    {
        let canStack = false;
        let item = this.getItemOnItemId(event);
        

        if(item.type=="equipmentsuite")
        {
            let suites = this.actor.items.filter(function(item){return ((item.type=="equipmentsuite")&&(item.system.stack))});
            if((suites.length>=1)&&(suites[0]._id != item._id))
            {
                new Dialog({title:game.i18n.localize("ad6_robotech.sheetText.dialogAlert"),
                    content:game.i18n.localize("ad6_robotech.sheetText.dialogSuites"),buttons:{ ok: { label: "O.K.", callback: () => {}}}, default: 'ok'}).render(true);
                canStack = false;
            }
            else{ canStack=true;}
        }
        if(item.type=="skill")
        {
            let desmarcando =false;
            let skills = this.actor.items.filter(function(item){return ((item.type=="skill")&&(item.system.stack))});
            if((this.actor.type=="vehicle")&&(this.actor.system.pilot !=""))
            {
                skills = game.actors.get(this.actor.system.pilot).items.filter(function(item){return ((item.type=="skill")&&(item.system.stack))});
            }
            
            for (const skill of skills) {
                if(skill._id == item._id){ desmarcando = true; }
            }

            if(skills.length == undefined){
                canStack = true;
            }
            else
            {
                if((desmarcando)||(skills.length <= 1))                
                {canStack = true;} else {
                    new Dialog({title:game.i18n.localize("ad6_robotech.sheetText.dialogAlert"),
                        content:game.i18n.localize("ad6_robotech.sheetText.dialogSills"),buttons:{ ok: { label: "O.K.", callback: () => {}}}, default: 'ok'}).render(true);
                        
                    canStack = false;
                }
            }
        }
        if(canStack)
        {
            if(!item.system.stack)
            {
                this.actor.system.dice = Number(this.actor.system.dice) + Number(item.system.skill);
                ///
                if(this.actor.type=="lieutenant")
                {
                    this.actor.system.attack = Number(this.actor.system.attack) + Number(item.system.skill);
                    this.actor.system.defend = Number(this.actor.system.defend) + Number(item.system.skill);
                    this.actor.system.redirect = Number(this.actor.system.redirect) + Number(item.system.skill);
                    this.actor.system.interact = Number(this.actor.system.interact) + Number(item.system.skill);
                    this.actor.system.assist = Number(this.actor.system.assist) + Number(item.system.skill);
                }
            }
            else{
                this.actor.system.dice = Number(this.actor.system.dice) - Number(item.system.skill);
                ///
                if(this.actor.type=="lieutenant")
                    {
                    
                        this.actor.system.attack = Number(this.actor.system.attack) - Number(item.system.skill);
                        this.actor.system.defend = Number(this.actor.system.defend) - Number(item.system.skill);
                        this.actor.system.redirect = Number(this.actor.system.redirect) - Number(item.system.skill);
                        this.actor.system.interact = Number(this.actor.system.interact) - Number(item.system.skill);
                        this.actor.system.assist = Number(this.actor.system.assist) - Number(item.system.skill);
                    }
            }
            this.actor.update({"system.dice":this.actor.system.dice});

            if(this.actor.type=="lieutenant")
            {
                this.actor.update({"system.attack":this.actor.system.attack});
                this.actor.update({"system.defend":this.actor.system.defend});
                this.actor.update({"system.redirect":this.actor.system.redirect});
                this.actor.update({"system.interact":this.actor.system.interact});
                this.actor.update({"system.assist":this.actor.system.assist});
            }

            item.update({"system.stack":!item.system.stack});
        }
        
    }
    
    _onHardwareStatus(event)
    {
        event.preventDefault();
        let element = event.currentTarget;
        let itemId = element.closest(".item").dataset.itemId;
        let target = element.closest(".item").dataset.target;
        let item = this.actor.items.get(itemId);

        if(target=="system.status")
            item.update({"system.status":!item.system.status});
        if(target=="system.suite")
            item.update({"system.suite":!item.system.suite});
    }
    getItemOnItemId(event)
    {
        event.preventDefault();
        let element = event.currentTarget;
        let itemId = element.closest(".item").dataset.itemId;
        let item = null;
        
        if((this.actor.type=="vehicle")&&(this.actor.system.pilot!=""))
        {
            let pilot = game.actors.get(this.actor.system.pilot);

            item = pilot.items.get(itemId);            
            if(item==undefined)
            {
                item = this.actor.items.get(itemId);    
            }
        }
        else{
            item = this.actor.items.get(itemId);
        }
        return item;
    }

    _onItemCreate(event)
    {

        let element = event.currentTarget;

        let type = element.closest(".item").dataset.type;
  
        
        let feature = {
             name: game.i18n.localize("ad6_robotech.sheetText." + type)
            ,type: type
        };

        this.actor.createEmbeddedDocuments("Item",[feature]);
    }
    _onCoreCheck(event)
    {        
        let item = this.getItemOnItemId(event);
        if(item.canRoll())
        {
            let actionPhase = this.actor.system.actionPhase;
            let rollType = this.actor.system.rollType;
            let name = this.actor.name;
            let dados = item.system.skill;
            coreCheck(dados, actionPhase,rollType,item.name,name,item.message);        
            item.consume();
        }
        else{ this.cantUseChatMessage(); }
    }

    _onReroll(event)
    {
        event.preventDefault();
        coreCheck(
            this.actor.system.reroll.dice, 
            this.actor.system.reroll.phase,
            this.actor.system.reroll.rollType,
            this.actor.system.reroll.name,
            this.actor.system.reroll.owner,
            "Re-Roll");

     

    }

    _onHexCheck(event)
    {
        event.preventDefault();
        let element = event.currentTarget;
        let phase = "";
        let value = "";
        let name ="";
        switch(this.actor.type)
        {
            case "main":
                name="";
                phase = this.actor.system.actionPhase;
                value = element.closest(".item").dataset.value;
                break;
            case "lieutenant":
                phase = element.closest(".item").dataset.phase;
                name = phase;
                value = element.closest(".item").dataset.value;
                break;
            case "vehicle":
                if(this.actor.system.type =="lieutenant")
                {
                    phase = element.closest(".item").dataset.phase;
                }
                else
                {
                    phase = this.actor.system.actionPhase;
                }
                
                value = element.closest(".item").dataset.value;
                break;
            case "swarm":
                phase = this.actor.system.actionPhase;
                value = this.actor.system.dice;
                break;
            default:
                break;
        }
        let rollType = this.actor.system.rollType;
        let owner = this.actor.name;
        
        let canroll = false;

        if((this.actor.type=="main")||((this.actor.type=="vehicle")&&(this.actor.system.type=="main")))
        {
            let skdice = 0;
            let skills = this.actor.items.filter(function(item){return ((item.type=="skill")&&(item.system.stack))});
            if((this.actor.type=="vehicle")&&(this.actor.system.pilot !=""))
                {
                    skills = game.actors.get(this.actor.system.pilot).items.filter(function(item){return ((item.type=="skill")&&(item.system.stack))});
                }
            if(skills.length>0)
            {
                for (const skill of skills) {
                    skdice += Number(skill.system.skill);
                }            
            }
            let sudice = this.howManySuiteDice();


            let burnout = -1;
            if(this.actor.type=="main")
            {
                burnout = Number(this.actor.system.burnout);
            }
            else{
                burnout = Number(game.actors.get(this.actor.system.pilot).system.burnout);
            }
            if(skdice>Number(burnout))
            {
                new Dialog({ title: game.i18n.localize("ad6_robotech.sheetText.dialogAlertBurnout"),
                    content: game.i18n.localize("ad6_robotech.sheetText.dialogBurnoutText"),
                    buttons:{
                        ok:{
                            label: "O.K."
                            ,callback:()=>{ canroll=true;
                                this.rollAndConsume(value,phase,rollType,phase,owner,"");
                            }
                        }
                        ,cap:{
                            label: game.i18n.localize("ad6_robotech.sheetText.dialogCap")
                            ,callback:()=>{ canroll=true;
                                let n = 0;
                                n = Number(burnout);
                                n+= Number(sudice);

                                this.rollAndConsume(n,phase,rollType,phase,owner,"");
                            }
                        }
                        ,no:{
                            label: "No"
                            ,callback:()=>{ canroll=false;}
                        }
                    }
                    }).render(true);
                   
            }
            else{ canroll = true; }            
        }
        else { canroll = true; }

        
        if(canroll){
            this.rollAndConsume(value,phase,rollType,phase,owner,"");

        }
    }

    howManySuiteDice()
    {
        let dice = 0;
        let suites = this.actor.items.filter(function(item){return ((item.type=="equipmentsuite")&&(item.system.stack))});
        if(suites.length>0)
        {
            for (const suite of suites) {
                dice += Number(suite.system.skill);
            }            
        }  
        return dice;
    }

    rollAndConsume(value,phase,rollType,name,owner,message)
    {

        let dados = value;
        let m = message;
        let suites = this.actor.items.filter(function(item){return ((item.type=="equipmentsuite")&&(item.system.stack))});
        if(suites.length>0)
        {
            for (const suite of suites) {
                
                
                if((suite.system.value!="∞")&&(toString(suite.system.value)!="")){
                    if(Number(suite.system.value)<=0){
                        // no lo puedo usar
                        dados = dados - Number(suite.system.skill);
                        m = game.i18n.localize("ad6_robotech.sheetText.cantUseDesc");
                    }
                }
            }   
        }
        coreCheck(dados, phase,rollType,name,owner,m);

        // guardar última tirada, para reroll rápido
        this.actor.system.reroll.dice = dados;
        this.actor.system.reroll.phase = phase;
        this.actor.system.reroll.rollType = rollType;
        this.actor.system.reroll.name = name;
        this.actor.system.reroll.owner = owner;
        this.actor.system.reroll.message = m;

        this.actor.update({
            "system.reroll.dice":dados,
            "system.reroll.phase": phase,
            "system.reroll.rollType": rollType,
            "system.reroll.name": name,
            "system.reroll.owner": owner,
            "system.reroll.message": m
        });


        //
        // consumir los items de equipo que estuvieren marcados
        if(suites.length>0)
        {
            for (const suite of suites) {
                if((suite.system.value!="∞")&&(suite.system.value!="")){
                    suite.update({"system.value":suite.system.value-1});
                }
            }            
        }  
    }
    
    _onItemRefresh(event)
    {
        let item = this.getItemOnItemId(event);
        item.refresh();
        
    }

    _onItemUse(event)
    {        
        let item = this.getItemOnItemId(event);
        console.log(item);
        if(item.canRoll()){
            console.log("antes");
            item.consume();
            console.log(item);
        }
        else{ this.cantUseChatMessage(); }
    

    }

    _onItemDescription(event)
    {
        
        let item = this.getItemOnItemId(event);
        item.describe(true);
    }
    _onItemEdit(event)
    {        
        let item = this.getItemOnItemId(event);
        item.sheet.render(true);
    }
    async _onItemDelete(event)
    {
        event.preventDefault();
        let element = event.currentTarget;
        let itemId = element.closest(".item").dataset.itemId;
        await this.actor.deleteEmbeddedDocuments("Item", [itemId])
    }

    cantUseChatMessage()
    {
        
        this.chatMessage(game.i18n.localize("ad6_robotech.sheetText.cantUseTitle"), game.i18n.localize("ad6_robotech.sheetText.cantUseDesc"),this.actor.name);
    }
    async chatMessage(title,desc, owner)
    {
        let cardData ={
            name: title
           ,description : desc
           ,owner: owner
           ,verbose: false
       };

        ChatMessage.create({
            speaker: ChatMessage.getSpeaker(),
            content: await renderTemplate("systems/ad6_robotech/templates/cards/description-card.hbs",cardData)
            });

    }


}