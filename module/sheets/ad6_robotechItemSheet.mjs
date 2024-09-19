export default class ad6_robotechItemSheet extends ItemSheet{

    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
          classes: ["ad6_robotech", "sheet", "item"]
          ,tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "general" }]
          ,width: 580
          ,height: 500
        });
      }

    get template(){
        const path = 'systems/ad6_robotech/templates/sheets/item';
        
        return path + '/item-' + this.item.type +'-sheet.hbs';
    }
    getData()
    {
        const data = super.getData();
        data.config = CONFIG.ad6_robotech;
        // Use a safe clone of the item data for further operations.
        const itemData = this.document.toObject(false);

        data.system = itemData.system;
        /*data.item.name = game.i18n.localize(data.system.intname);
        data.system.description = game.i18n.localize(data.system.intdesc);
        if(!(data.system.benefit===undefined)&&!(data.system.benefit===null)){data.system.benefit = game.i18n.localize(data.system.intcad1);}
        if(!(data.system.cost===undefined)&&!(data.system.cost===null)){data.system.cost = game.i18n.localize(data.system.intcad2);}*/
        
        /*
        data.item.name = (this.isDefinedLocalization(data.system.intname)?game.i18n.localize(data.system.intname):data.item.name);
        data.system.description = (this.isDefinedLocalization(data.system.intdesc)?game.i18n.localize(data.system.intdesc):data.system.description);

        if(!(data.system.benefit===undefined)&&!(data.system.benefit===null))
        {
            data.system.benefit = (this.isDefinedLocalization(data.system.intcad1)?game.i18n.localize(data.system.intcad1):data.system.benefit);
        }
        if(!(data.system.cost===undefined)&&!(data.system.cost===null))
        {
            data.system.cost = (this.isDefinedLocalization(data.system.intcad2)?game.i18n.localize(data.system.intcad2):data.system.cost);
        }

*/
        data.flags = itemData.flags;

        return data;
    }

    isDefinedLocalization(localization_string)
    {
        let translated = game.i18n.localize(localization_string);
        
        return (!(translated===undefined)&&!(translated===null)&&!(translated===""));
    }
}