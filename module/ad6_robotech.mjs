import {ad6_robotech} from './config.mjs'
import ad6_robotechItemSheet from './sheets/ad6_robotechItemSheet.mjs';
import ad6_robotechCharacterSheet from './sheets/ad6_robotechCharacterSheet.mjs';
import ad6_robotechItem from './documents/ad6_robotechItem.mjs';
//import ad6_robotechActor from './documents/ad6_robotechActor.mjs';

import './ad6_swarm_visual.mjs';
import './ad6_phases_combat_tracker.mjs';
import './ad6_damage_management.mjs';
import './ad6_assist_pool.mjs';


export function broadcastToAll(payload) {
  Hooks.callAll("ad6-assist-create", payload); // Ejecutar local
  game.socket.emit("system.ad6_robotech", {
    ...payload,
    fromUserId: game.user.id
  });
}

Hooks.on("getSceneControlButtons", (controls) => {
  const tokenControls = controls.find(c => c.name === "token");
  if (!tokenControls) return;

  if (!tokenControls.tools.some(t => t.name === "grow-token")) {
    tokenControls.tools.push({
      name: "grow-token",
      title: "Aumentar tamaño del token",
      icon: "fas fa-expand-arrows-alt",
      button: true, // <- Esta es la clave: NO activa un modo, sólo ejecuta una acción
      visible: true,
      onClick: () => {
        const selected = canvas.tokens.controlled;

        if (selected.length === 0) {
          ui.notifications.warn("No hay ningún token seleccionado.");
          return;
        }

        for (const token of selected) {
          const doc = token.document;
          doc.update({
            width: doc.width + 1,
            height: doc.height + 1
          });
        }

        ui.notifications.info(`Tamaño aumentado en ${selected.length} token(s).`);
      }
    });
  }
  if (!tokenControls.tools.some(t => t.name === "shrink-token")) {
    tokenControls.tools.push({
      name: "shrink-token",
      title: "Disminuir tamaño del token",
      icon: "fas fa-compress-arrows-alt",
      button: true,
      visible: true,
      onClick: () => {
        const selected = canvas.tokens.controlled;
  
        if (selected.length === 0) {
          ui.notifications.warn("No hay ningún token seleccionado.");
          return;
        }
  
        for (const token of selected) {
          const doc = token.document;
          const newWidth = Math.max(1, doc.width - 1);
          const newHeight = Math.max(1, doc.height - 1);
  
          if (newWidth === doc.width && newHeight === doc.height) {
            ui.notifications.warn(`${token.name} ya está en tamaño mínimo.`);
          } else {
            doc.update({
              width: newWidth,
              height: newHeight
            });
          }
        }
  
        ui.notifications.info(`Tamaño reducido en ${selected.length} token(s).`);
      }
    });
  }
  
});



async function preloadHandlebarsTemplates() {
    return loadTemplates([
      // Actor partials.
       'systems/ad6_robotech/templates/sheets/partials/character-skills.hbs'
      ,'systems/ad6_robotech/templates/sheets/partials/character-gear.hbs'
      ,'systems/ad6_robotech/templates/sheets/partials/character-armor.hbs'
      ,'systems/ad6_robotech/templates/sheets/partials/character-vitals.hbs'
      ,'systems/ad6_robotech/templates/sheets/partials/character-stress.hbs'
      ,'systems/ad6_robotech/templates/sheets/partials/character-wounds.hbs'
      ,'systems/ad6_robotech/templates/sheets/partials/character-drama.hbs'
      ,'systems/ad6_robotech/templates/sheets/partials/character-heroic.hbs'
      ,'systems/ad6_robotech/templates/sheets/partials/character-nature.hbs'
      ,'systems/ad6_robotech/templates/sheets/partials/character-proficiency.hbs'
      ,'systems/ad6_robotech/templates/sheets/partials/character-elements.hbs'
      ,'systems/ad6_robotech/templates/sheets/partials/character-elements-list.hbs'
      ,'systems/ad6_robotech/templates/sheets/partials/character-proficiency-list.hbs'
      ,'systems/ad6_robotech/templates/sheets/partials/character-element.hbs'
      ,'systems/ad6_robotech/templates/sheets/partials/character-prof.hbs'

      ,'systems/ad6_robotech/templates/sheets/partials/character-hexlvl.hbs'
      ,'systems/ad6_robotech/templates/sheets/partials/character-hexbps.hbs'
      ,'systems/ad6_robotech/templates/sheets/partials/character-hexspd.hbs'
      ,'systems/ad6_robotech/templates/sheets/partials/character-equipmentsuite.hbs'
      ,'systems/ad6_robotech/templates/sheets/partials/character-talent.hbs'
      ,'systems/ad6_robotech/templates/sheets/partials/character-section-talents.hbs'
      ,'systems/ad6_robotech/templates/sheets/partials/character-section-items.hbs'
      ,'systems/ad6_robotech/templates/sheets/partials/character-section-skills.hbs'
      ,'systems/ad6_robotech/templates/sheets/partials/character-third-structure.hbs'
      
      ,'systems/ad6_robotech/templates/cards/description-card.hbs'
      ,'systems/ad6_robotech/templates/sheets/partials/item-nav-conf.hbs'
      ,'systems/ad6_robotech/templates/sheets/partials/item-nav.hbs'
      ,'systems/ad6_robotech/templates/sheets/partials/character-lieutenant-vitals.hbs'
      ,'systems/ad6_robotech/templates/sheets/partials/character-swarm-vitals.hbs'
      ,'systems/ad6_robotech/templates/sheets/partials/hex-gen.hbs'
      ,'systems/ad6_robotech/templates/sheets/partials/character-vitals-mecha.hbs'
      ,'systems/ad6_robotech/templates/sheets/partials/character-vehicle-framework.hbs'
      ,'systems/ad6_robotech/templates/sheets/partials/character-hardware.hbs'
      ,'systems/ad6_robotech/templates/sheets/partials/character-feature.hbs'
      ,'systems/ad6_robotech/templates/sheets/partials/vehicle-section-items.hbs'
      ,'systems/ad6_robotech/templates/sheets/partials/vehicle-equipmentsuite.hbs'
      ,'systems/ad6_robotech/templates/sheets/partials/character-third-alternative.hbs'
      ,'systems/ad6_robotech/templates/sheets/partials/character-third-vehicle.hbs'
      ,'systems/ad6_robotech/templates/phases.hbs'
    ]);
  };
  
function updatePack(cad)
{
  let i =0;
  try{
      const packSkills = game.packs.get(cad);
      const packDataSkills = packSkills.getDocuments();
      if(packSkills!=undefined){
        let i =0;
        for (const value of packSkills) {
          value.prepareData();
          i++;
        }
        console.log(cad + " <-- Idioma Actualizado");

      }
  }
  catch(error)
  {
    console.log("ERROR:" + cad + " No existe");
  }

}

Hooks.once("ready", function(){

  if(game.user.isGM){
  // Actualiza idioma de los objetos bien configurados del juego
    const gameItems = game.items;
  
    for (const value of gameItems ) {
      value.prepareData();
    }
    console.log("game.items [" + gameItems.size + "] <-- Idioma Actualizado");

    updatePack("ad6_robotech_compendium.skills");
    updatePack("ad6_robotech_compendium.talents");
    updatePack("ad6_robotech_macross_saga.equipmentsuite");
    updatePack("ad6_robotech_macross_saga.gear");
    updatePack("ad6_robotech_macross_saga.mechaequipment");
    updatePack("ad6_robotech_macross_saga.mecha");
    updatePack("ad6_robotech_homefront.equipmentsuite");
    updatePack("ad6_robotech_homefront.gear");
    updatePack("ad6_robotech_homefront.mechaequipment");
    updatePack("ad6_robotech_homefront.mecha");
  }
 
});

Hooks.on("createChatMessage", (msg) => {
  const data = msg.flags?.["ad6_robotech"];
  if (!data?.assistSync) return;

  const actorId = data.actorId;
  const value = data.assistValue;

  setTimeout(() => {
    if (!game.ad6_assistPools) game.ad6_assistPools = {};
    game.ad6_assistPools[actorId] = value;

    if (!document.querySelector(`.assist-overlay[data-actor-id="${actorId}"]`)) {
      // Llamamos a la función de render, asegurando que esté accesible
      if (typeof renderAssistOverlay === "function") {
        renderAssistOverlay(actorId, value);
      } else if (globalThis.renderAssistOverlay) {
        globalThis.renderAssistOverlay(actorId, value);
      } else {
        console.warn("⚠️ No se encontró renderAssistOverlay para actorId", actorId);
      }
    }
  }, 200); // espera para que game.actors esté cargado
});

Hooks.on("createChatMessage", (msg) => {
  const data = msg.flags?.["ad6_robotech"];
  if (!data?.assistConsumed) return;

  const actorId = data.actorId;
  const newValue = data.newValue;

  if (!game.ad6_assistPools) game.ad6_assistPools = {};
  game.ad6_assistPools[actorId] = newValue;

  const div = document.querySelector(`.assist-overlay[data-actor-id="${actorId}"]`);
  if (div) {
    const span = div.querySelector(".assist-value");
    if (span) span.textContent = newValue;
    if (newValue <= 0) div.remove();
  }
});

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

    /* para el botón de aplicar daño */
    Handlebars.registerHelper("userHasActor", function() {
      const character = game.user.character;
      const controlled = canvas.tokens?.controlled || [];
      return !!(character || controlled.length > 0);
  });

    Handlebars.registerHelper("hasTarget", function() {
    return game.user.targets.size > 0;
    });

    Handlebars.registerHelper("and", function(a, b) {
      return a && b;

      
  });
  Handlebars.registerHelper("eq", function(a, b) {
    return a === b;
  });
    /* para el botón de aplicar daño */


});

Actor.prototype.getMyToken = function () {
  const tokens = this.getActiveTokens();
  if (!tokens.length) return null;
  return tokens[0]; // o aplicar lógica adicional si hay más de uno
};

/* para elbotón de aplicar daño */

/*Hooks.once("ready", () => {
  console.log("🧩 Registrando socket listener en canal ad6-sync");

  game.socket.on("module.ad6-sync", (payload) => {
    console.log("📡 Mensaje recibido por socket ad6-sync:", payload);
    if (payload.type === "refreshTracker") {
      ui.combat?.render(true);
    }
  });
});*/
Hooks.once("ready", async () => {
  const macroName = "ad6ApplyDamage";

  const existing = game.macros.getName(macroName);
  if (!existing) {
    const macroCommand = `
      if (!game.user.isGM) {
        ui.notifications.warn("Esta macro debe ejecutarse como GM.");
        return;
      }

      const {
        targetTokenId,
        adjustedDamage,
        damageType,
        rawDamage,
        residual,
        finalType,
        selectedPen,
        overkill
      } = this;

      // Recuperar el token desde cualquier escena
      let token = canvas.tokens.get(targetTokenId);
      if (!token) {
        const tokenDoc = game.scenes.find(s => s.tokens.get(targetTokenId))?.tokens.get(targetTokenId);
        token = tokenDoc?.object;
      }

      if (!token) {
        ui.notifications.error("Token objetivo no encontrado en ninguna escena.");
        return;
      }

      const actor = token.actor;
      if (!actor) {
        ui.notifications.error("El token no tiene un actor asignado.");
        return;
      }

      if (typeof actor.applyDamage !== "function") {
        ui.notifications.warn("El actor no tiene implementada la función applyDamage.");
        return;
      }

      await actor.applyDamage(adjustedDamage, damageType, rawDamage, residual, finalType, selectedPen, overkill);
      console.log(\`💥 applyDamage ejecutado sobre \${actor.name}\`);
    `;

    await Macro.create({
      name: macroName,
      type: "script",
      scope: "global",
      command: macroCommand.trim(),
      permission: { default: 1 },
      flags: { "ad6_robotech": { autoCreated: true } }
    });

    ui.notifications.info("✅ Macro 'ad6ApplyDamage' creada automáticamente. Recuerda marcarla como 'Ejecutar como GM'.");
  }
});



Hooks.on("init", () => {
  console.log("Initiative Phases Module | Initialized");

   

  Handlebars.registerHelper("getUserColor", function(userId) {
    const user = game.users.get(userId);
    return user?.color || "#999";
  });

  
  Handlebars.registerHelper("concat", function(...args) {
    return args.slice(0, -1).join('');
  });
});



const FLAG_SCOPE = "ad6_robotech"; // Usa aquí el nombre real de tu sistema
