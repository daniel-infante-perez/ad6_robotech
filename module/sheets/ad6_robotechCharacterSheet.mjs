import { coreCheck } from "../ad6_roll.mjs";

export default class ad6_robotechCharacterSheet extends ActorSheet{
    
    static get defaultOptions() {
  
        
        return foundry.utils.mergeObject(super.defaultOptions, {
          classes: ["ad6_robotech", "sheet", "actor"],
          template: "systems/ad6_robotech/templates/sheets/actor/character-main-sheet.hbs",
          width: 890,
          height: 890,
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

        data.system = this.actor.system;
        data.gears = this.actor.items.filter(function(item){return item.type=="gear"});
        data.suites = this.actor.items.filter(function(item){return item.type=="equipmentsuite"});
        data.talents = this.actor.items.filter(function(item){return item.type=="talent"});
        data.skills = this.actor.items.filter(function(item){return item.type=="skill"});
        data.features = this.actor.items.filter(function(item){return item.type=="feature"});
        data.hardwares = this.actor.items.filter(function(item){return item.type=="hardware"});

        data.type = this.actor.type;

        if(this.actor.type=="vehicle")
        {
            if(this.actor.system.type !="lieutenant")
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
        
        if(this.actor.type=="vehicle"){
        data.hex12 = {  
             value: Math.ceil(data.system.structure.max/3)
            ,lbl: "ad6_robotech.sheetText.redstr"
            ,phase: ""
            ,rollable:  "visibility: hidden;"
            ,rdonly: "readonly"
        };
    }
        
        //data.flags = actorData.flags;
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

            html.find(".core-check").click(this._onCoreCheck.bind(this));
            html.find(".hex-check").click(this._onHexCheck.bind(this));

            html.find(".item-create").click(this._onItemCreate.bind(this));


            html.find(".hardware-status").click(this._onHardwareStatus.bind(this));
            html.find(".hardware-status").click(this._onHardwareStatus.bind(this));
            
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
        let item = this.actor.items.get(itemId);
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

    _onHexCheck(event)
    {
        event.preventDefault();
        let element = event.currentTarget;
        let phase = "";
        let value = "";
        
        switch(this.actor.type)
        {
            case "lieutenant":
                phase = element.closest(".item").dataset.phase;
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
        let name = this.actor.name;

        

        coreCheck(value, phase,rollType,phase,name,"");
    }

    
    _onItemRefresh(event)
    {
        let item = this.getItemOnItemId(event);
        item.refresh();
        
    }

    _onItemUse(event)
    {        
        let item = this.getItemOnItemId(event);
        
        if(item.canRoll()){
            item.consume();
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