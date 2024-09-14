import {ad6_robotech} from './config.mjs'
import ad6_robotechItemSheet from './sheets/ad6_robotechItemSheet.mjs';
import ad6_robotechCharacterSheet from './sheets/ad6_robotechCharacterSheet.mjs';
import ad6_robotechItem from './documents/ad6_robotechItem.mjs';
//import ad6_robotechActor from './documents/ad6_robotechActor.mjs';


async function preloadHandlebarsTemplates() {
    return loadTemplates([
      // Actor partials.
       'systems/ad6_robotech/templates/sheets/partials/character-skills.hbs'
      ,'systems/ad6_robotech/templates/sheets/partials/character-gear.hbs'
      ,'systems/ad6_robotech/templates/sheets/partials/character-vitals.hbs'
      ,'systems/ad6_robotech/templates/sheets/partials/character-stress.hbs'
      ,'systems/ad6_robotech/templates/sheets/partials/character-wounds.hbs'
      ,'systems/ad6_robotech/templates/sheets/partials/character-drama.hbs'
      ,'systems/ad6_robotech/templates/sheets/partials/character-heroic.hbs'
      ,'systems/ad6_robotech/templates/sheets/partials/character-nature.hbs'
      ,'systems/ad6_robotech/templates/sheets/partials/character-proficiency.hbs'
      ,'systems/ad6_robotech/templates/sheets/partials/character-elements.hbs'
      ,'systems/ad6_robotech/templates/sheets/partials/character-hexlvl.hbs'
      ,'systems/ad6_robotech/templates/sheets/partials/character-hexbps.hbs'
      ,'systems/ad6_robotech/templates/sheets/partials/character-hexspd.hbs'
      ,'systems/ad6_robotech/templates/sheets/partials/character-equipmentsuite.hbs'
      ,'systems/ad6_robotech/templates/sheets/partials/character-talent.hbs'
      ,'systems/ad6_robotech/templates/sheets/partials/character-section-talents.hbs'
      ,'systems/ad6_robotech/templates/sheets/partials/character-section-items.hbs'
      ,'systems/ad6_robotech/templates/sheets/partials/character-section-skills.hbs'
      ,'systems/ad6_robotech/templates/sheets/partials/character-third-structure.hbs'
      ,'systems/ad6_robotech/templates/cards/equipmentsuite-card.hbs'
      ,'systems/ad6_robotech/templates/cards/gear-card.hbs'
      ,'systems/ad6_robotech/templates/cards/talent-card.hbs'
      ,'systems/ad6_robotech/templates/cards/description-card.hbs'
      ,'systems/ad6_robotech/templates/sheets/partials/item-nav-conf.hbs'
      ,'systems/ad6_robotech/templates/sheets/partials/item-nav.hbs'
      ,'systems/ad6_robotech/templates/sheets/partials/character-lieutenant-vitals.hbs'
      ,'systems/ad6_robotech/templates/sheets/partials/character-swarm-vitals.hbs'
      ,'systems/ad6_robotech/templates/sheets/partials/hex-gen.hbs'
      ,'systems/ad6_robotech/templates/sheets/partials/character-vitals-mecha.hbs'
      ,'systems/ad6_robotech/templates/sheets/partials/character-vehicle-framework.hbs'
    ]);
  };
  


Hooks.once("init", function(){
    console.log("AD6 Robotech - Cargando Hooks Once Init")
    CONFIG.ad6_robotech = ad6_robotech;
    //CONFIG.Item.entityClass = ad6_robotechItem;
    CONFIG.Item.documentClass = ad6_robotechItem;
    //CONFIG.Actor.entityClass = ad6_robotechActor;


    Items.unregisterSheet("core", ItemSheet);
    Items.registerSheet("ad6_robotech",ad6_robotechItemSheet,{ makeDefalut: true});
    Actors.unregisterSheet("core", ActorSheet);
    Actors.registerSheet("ad6_robotech",ad6_robotechCharacterSheet,{ makeDefalut: true});
    preloadHandlebarsTemplates();
    
   // Handlebars.registerHelper("optionsDataList",function) no sé hacer el código
   Handlebars.registerHelper("enriquecer",function(t){
    return TextEditor.enrichHTML(t, {async:true});
   });
});