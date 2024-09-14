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

        data.type = this.actor.type;

        data.hex0 = {  field: "system.attack"
                      ,value: data.system.attack
                      ,lbl: "ad6_robotech.phase.attack"
                      ,phase: "attack"
                      ,rollable: "visible"
        };
        data.hex1 = {  field: "system.defend"
            ,value: data.system.defend
            ,lbl: "ad6_robotech.phase.defend"
            ,phase: "defend"
            ,rollable: "visible"
        };
        data.hex2 = {  field: "system.redirect"
            ,value: data.system.redirect
            ,lbl: "ad6_robotech.phase.redirect"
            ,phase: "redirect"
            ,rollable: "visible"
        };
        data.hex3 = {  field: "system.assist"
            ,value: data.system.assist
            ,lbl: "ad6_robotech.phase.assist"
            ,phase: "assist"
            ,rollable: "visible"
        };
        data.hex4 = {  field: "system.interact"
            ,value: data.system.interact
            ,lbl: "ad6_robotech.phase.interact"
            ,phase: "interact"
            ,rollable: "visible"
        };
        data.hex5 = {  field: "system.units"
            ,value: data.system.units
            ,lbl: "ad6_robotech.sheetText.units"
            ,phase: ""
            ,rollable: "visible"
        };

        data.hex6 = {  field: "system.level"
            ,value: data.system.level
            ,lbl: "ad6_robotech.sheetText.level"
            ,phase: ""
            ,rollable: "hidden"
        };
        data.hex7 = {  field: "system.buildPoints"
            ,value: data.system.buildPoints
            ,lbl: "ad6_robotech.sheetText.buildPoints"
            ,phase: ""
            ,rollable: "hidden"
        };
        data.hex8 = {  field: "system.speed"
            ,value: data.system.speed
            ,lbl: "ad6_robotech.sheetText.speed"
            ,phase: ""
            ,rollable: "hidden"
        };                
        
        data.hex9 = {  field: "system.units"
            ,value: data.system.units
            ,lbl: "ad6_robotech.sheetText.units"
            ,phase: ""
            ,rollable: "hidden"
        };

        data.hex10 = {  field: "system.dice"
            ,value: data.system.dice
            ,lbl: "ad6_robotech.sheetText.dice"
            ,phase: ""
            ,rollable: "visible"
        };

        data.hex11 = {  field: "system.totalWounds"
            ,value: data.system.totalWounds
            ,lbl: "ad6_robotech.sheetText.totalWounds"
            ,phase: ""
            ,rollable: "hidden"
        };
        
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

    
    }
    
    getItemOnItemId(event)
    {
        event.preventDefault();
        let element = event.currentTarget;
        let itemId = element.closest(".item").dataset.itemId;
        let item = this.actor.items.get(itemId);
        return item;
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
        
        if(item.consumable()){
            item.consume();
        }
        else{ this.cantUseChatMessage(); }
    

    }

    _onItemDescription(event)
    {
        //console.log("entrop");
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