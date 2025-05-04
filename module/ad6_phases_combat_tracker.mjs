const FLAG_SCOPE = "ad6_robotech"; // Usa aquí el nombre real de tu sistema


Hooks.on("init", () => {
  console.log("Initiative Phases Module | Initialized");

   // Registrar setting para número máximo de acciones por personaje
   game.settings.register("ad6_robotech", "maxActions", {
    name: "Número máximo de acciones por personaje",
    hint: "Permite definir cuántas acciones puede asignar cada personaje por ronda.",
    scope: "world",
    config: true,
    default: 2,
    type: Number
  });



  Handlebars.registerHelper("isConfirmed", function(userId) {
    const user = game.users.get(userId);
    return user?.getFlag("ad6_robotech", "confirmed") || false;
  });



});


Hooks.on("renderCombatTracker", async (app, html, data) => {
    const combat = game.combat;
    if (!combat) return;
  
    const subphases = {
      Soporte: ["Asistir", "Ocultar", "Observar"],
      Operaciones: ["Atacar", "Defender", "Redirigir"],
      Cinematica: ["Inhibir", "Interactuar"]
    };
  
    const assignments = {};
    for (const [fase, subs] of Object.entries(subphases)) {
      for (const sub of subs) {
        assignments[`${fase}-${sub}`] = [];
      }
    }
  
        for (const c of combat.combatants) {
          const acts = c.getFlag(FLAG_SCOPE, "actions") || [];
        
          for (const act of acts) {
            const key = `${act.phase}-${act.subphase}`;
            if (assignments[key]) {
              const assignedByUser = game.users.get(act.userId);
              const isConfirmed = assignedByUser?.getFlag(FLAG_SCOPE, "confirmed") || false;
        
              assignments[key].push({
                name: c.name,                    // nombre del combatiente (actor)
                userId: act.userId,              // ID del usuario que asignó
                isConfirmed,                     // si el usuario confirmó
                assignedByGM: assignedByUser?.isGM || false ,// para estilo visual opcional
                count: act.count || 1,
                actorId: c.actor?.id  // <--- asegúrate de incluir esto si usas actorId en el HTML
              });
            }
          }
        }
  
    const confirmedUsers = game.users
      .filter(u => u.getFlag(FLAG_SCOPE, "confirmed"))
      .map(u => u.name);
  
    const container = await renderTemplate("systems/ad6_robotech/templates/phases.hbs", {
      subphases,
      assignments,
      confirmed: game.user.getFlag(FLAG_SCOPE, "confirmed") || false,
      confirmedUsers,
      isGM: game.user.isGM
    });
  
    html.append(container);
  
    const confirmed = game.user.getFlag(FLAG_SCOPE, "confirmed") || false;
  
    if (!confirmed) {
      
      html.find(".phase-cell").on("click", async function (event) {
        const target = event.currentTarget;
        const phase = target.dataset.phase;
        const subphase = target.dataset.subphase;
      
        let actor = game.user.character;
      
        // GM: usa actor del token seleccionado
        if (game.user.isGM) {
          actor = canvas.tokens.controlled[0]?.actor;
        }
      
        if (!actor) {
          ui.notifications.warn("No hay un actor asignado o seleccionado.");
          return;
        }
      
        const combat = game.combat;
        if (!combat) return;
      
        const combatant = combat.combatants.find(c => c.actor?.id === actor.id);
        if (!combatant) {
          ui.notifications.warn("El actor no está en el combate.");
          return;
        }
      
        const actions = combatant.getFlag(FLAG_SCOPE, "actions") || [];
        const index = actions.findIndex(a => a.phase === phase && a.subphase === subphase);
        const maxActions = game.settings.get("ad6_robotech", "maxActions");
        const currentTotal = actions.reduce((sum, a) => sum + (a.count || 1), 0);
      
        if (index === -1) {
          // No hay acción en esta subfase
          if (currentTotal < maxActions) {
            actions.push({
              phase,
              subphase,
              userId: game.user.id,
              count: 1
            });
          } else {
            ui.notifications.warn(`Ya has asignado el máximo de ${maxActions} acciones.`);
            return;
          }
        } else {
          const currentCount = actions[index].count || 1;
          if (currentCount === 1) {
            if (currentTotal < maxActions) {
              actions[index].count = 2;
            } else {
              // No se puede subir a x2 → quitar
              actions.splice(index, 1);
            }
          } else {
            // Si ya está como x2 → quitar
            actions.splice(index, 1);
          }
        }
      
        await combatant.setFlag(FLAG_SCOPE, "actions", actions);
        ui.combat.render(true);
      });
      
      
      
  
  
      
    }
    html.find(".refresh-actions").on("click", async function () {
      ui.combat.render(true);
    });
  
    html.find(".reset-actions").on("click", async function () {
      /*for (const c of combat.combatants) {
        await c.unsetFlag(FLAG_SCOPE, "actions");
      }
      for (const user of game.users) {
        await user.unsetFlag(FLAG_SCOPE, "confirmed");
      }
      game.socket.emit("module.ad6-sync", {
        type: "refreshTracker"
      });
      ui.combat.render(true); *//*await renderCombatTracker();*/
      /*for (const c of combat.combatants) {
        await c.unsetFlag(FLAG_SCOPE, "actions");
      }
      for (const user of game.users) {
        await user.unsetFlag(FLAG_SCOPE, "confirmed");
      }
      game.socket.emit("module.ad6-sync", {
        type: "refreshTracker"
      });*/
      //ui.combat.render(true); /*await renderCombatTracker();*/
    });
  
   
    html.find(".confirm-actions").on("click", async function () {
        await game.user.setFlag(FLAG_SCOPE, "confirmed", true);
  
        console.log("🛰️ Emitiendo refresh por ad6-sync");
        game.socket.emit("module.ad6-sync", {
          type: "refreshTracker"
        });
  
        ui.combat.render(true);
        
  
    });
  });
  
  
  Hooks.on("updateCombat", async (combat, updateData) => {
    // Solo el GM ejecuta esta limpieza
    if (!game.user.isGM) return;
  
    // Detectar si se cambió la ronda
    if (updateData.round !== undefined) {
      // Borrar las acciones de todos los combatientes
      for (const c of combat.combatants) {
        await c.unsetFlag(FLAG_SCOPE, "actions");
      }
  
      // Borrar la confirmación de todos los usuarios
      for (const user of game.users) {
        await user.unsetFlag(FLAG_SCOPE, "confirmed");
      }
  
      // Emitir socket para refrescar el tracker en todos los clientes
      game.socket.emit("module.ad6-sync", {
        type: "refreshTracker"
      });
  
      // Refrescar visualmente en el GM
      ui.notifications.info("Fase reiniciada por nueva ronda.");
      ui.combat.render(true);
    }
  });
  