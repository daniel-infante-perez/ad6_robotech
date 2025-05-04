
function normalizeArmorType(scale) {
    const normalized = (scale || "").toLowerCase();
    if (normalized.includes("light") || normalized.includes("ligero")) return "L";
    if (normalized.includes("mecha")) return "M";
    if (normalized.includes("naval")) return "N";
    return "L"; // valor por defecto si no se reconoce
  }
  
  Actor.prototype.floatDamageText = function (amount, type = "L") {
    const token = this.getActiveTokens()[0];
    if (!token) return;
  
    const color = {
      L: "#ff4444",
      M: "#ffaa00",
      N: "#66ccff"
    }[type] || "#ffffff";
  
    canvas.interface.createScrollingText(
      token.center,
      `💥 ${amount} ${type}`,
      {
        anchor: CONST.TEXT_ANCHOR_POINTS.TOP,
        direction: 1,
        distance: 40,
        fontSize: 28,
        color
      }
    );
  };
  
  Actor.prototype.getArmor = function () {
    let armor = 0;
    let armorType = "L"; // Valor por defecto
    let resist = 0;
  
    switch (this.type) {
        case "vehicle":
            armor = this.system.armor?.value || 0;
            armorType = normalizeArmorType(this.system.scale);
            resist = this.system.resist || 0;
            break;
  
        case "main":
        case "lieutenant":
        case "swarm":
            // Buscar la primera armadura equipada
            const equippedArmor = this.items.find(i => i.type === "armor" && i.system.equip === true);
            if (equippedArmor) {
                const armorField = equippedArmor.system.armor?.toUpperCase().trim() || "";
                resist = equippedArmor.system.resist || 0;
  
                // Regex para extraer número + tipo: ej. "2M", "10L", "1N"
                const regex = /^(\d+)?\s*([LMN])?$/i;
                const match = armorField.match(regex);
                if (match) {
                    armor = parseInt(match[1]) || 0;
                    armorType = match[2] || "L"; // Si no hay letra, se asume L
                }
            }
            break;
  
        default:
            // Nada definido, se mantiene en 0
            break;
    }
  
    return [armor, armorType, resist];
  };
  
  function parsePenetration(penField) {
    const pen = penField.trim().toUpperCase(); // "P2", "P0|2", etc.
    const regex = /^P(\d+)(?:\|(\d+))?$/i;
    const match = pen.match(regex);
  
    if (!match) return { values: [0], multiple: false };
  
    const x = parseInt(match[1]);
    const y = match[2] ? parseInt(match[2]) : null;
  
    return {
        values: y !== null ? [x, y] : [x],
        multiple: y !== null
    };
  }
  
  function convertAndApplyArmor(damageType, rawDamage, armorType, armorValue) {
    let adjustedDamage = 0;
    let residual = 0;
    let finalType = damageType;
  
    if (damageType === armorType) {
        adjustedDamage = Math.max(rawDamage - armorValue, 0);
    } else {
        // Conversiones y residuos
        if (damageType === "M" && armorType === "L") {
            finalType = "L";
            adjustedDamage = Math.max((rawDamage * 10) - armorValue, 0);
        } else if (damageType === "N" && armorType === "M") {
            finalType = "M";
            adjustedDamage = Math.max((rawDamage * 10) - armorValue, 0);
        } else if (damageType === "L" && armorType === "M") {
            finalType = "M";
            const converted = Math.floor(rawDamage / 10);
            residual = rawDamage % 10;
            adjustedDamage = Math.max(converted - armorValue, 0);
        } else if (damageType === "M" && armorType === "N") {
            finalType = "N";
            const converted = Math.floor(rawDamage / 10);
            residual = rawDamage % 10;
            adjustedDamage = Math.max(converted - armorValue, 0);
        } else {
            // Daño incompatible (ej. L vs N o N vs L)
            adjustedDamage = 0;
        }
    }
    //console.log("DamageType:" + damageType+"-RawDamage:"+rawDamage+"-armorType:"+armorType+"-armorValue:"+armorValue+"-"  );
    return {
        adjustedDamage,
        finalType,
        residual
    };
  }

  

  
Actor.prototype.applyDamage = async function (adjustedDamage, damageType, rawDamage, residual, finalType, selectedPen, overkill,source) {
    console.log(`Aplicando ${adjustedDamage} puntos de daño a ${this.name}`);
    //console.log(source);
    /*let sourceToken = source.getMyToken();
    let targetToken = this.getMyToken();
  
    if (sourceToken && targetToken) {
      launchBeamEffect(sourceToken, targetToken);
    }*/
  
    const isVehicle = this.type === "vehicle";
    const actorType = isVehicle ? (this.system.type || "") : this.type;
  
    // 1. MAIN o VEHICLE tipo MAIN
    if (this.type === "main" || (isVehicle && actorType === "main")) {
      ui.notifications.info(`${this.name} ha recibido ${adjustedDamage} puntos de daño tipo ${finalType}. Aplícalo manualmente.`);
      return;
    }
  
  // 2. LIEUTENANT (no vehicle)
  if (this.type === "lieutenant") {
    console.log("entro");
    if (adjustedDamage <= 0) return; // No aplicar daño si es cero
  
    const wndFields = ["wnd1", "wnd2", "wnd3", "wnd4", "wnd5", "wnd6", "wnd7"];
    const availabilityFlags = {
      wnd1: this.system.wnda1,
      wnd2: this.system.wnda2,
      wnd3: this.system.wnda3,
      wnd7: this.system.wnda7
    };
  
    // Determinar qué casillas están disponibles
    const available = wndFields.filter(w => {
      if (["wnd4", "wnd5", "wnd6"].includes(w)) return true;
      return availabilityFlags[w] === true;
    });
  
    // Verificar si es zentraedi
    const isZentraedi = this.system?.race?.toLowerCase() === "zentraedi";
  
    // Calcular cuántas heridas aplicar
    const woundsToApply = isZentraedi
      ? Math.floor(adjustedDamage / 5)
      : adjustedDamage;
  
      console.log("woundsToApply:"+woundsToApply);
    if (woundsToApply <= 0) return;
  
    // Aplicar daño marcando casillas
    let updates = {};
    let woundsApplied = 0;
  
    for (let field of available) {
      if (this.system[field] === false) {
        updates[`system.${field}`] = true;
        woundsApplied++;
        if (woundsApplied >= woundsToApply) break;
      }
    }
  
    await this.update(updates);
  
    const remainingFree = available.filter(w => !updates[`system.${w}`] && this.system[w] === false);
    if (woundsApplied < woundsToApply || remainingFree.length === 0) {
      const token = this.getActiveTokens()[0];
      if (token?.combatant) {
        await token.combatant.update({ defeated: true });
        await this.toggleStatusEffect("dead", { active: true });
      }
    }
  
    this.floatDamageText(adjustedDamage, "L");
    return;
  }
  
  
  
    // 3. VEHICLE tipo LIEUTENANT
    if (isVehicle && actorType === "lieutenant") {
      const currentStructure = this.system.structure?.value || 0;
      const newStructure = currentStructure - adjustedDamage;
  
      await this.update({ "system.structure.value": Math.max(newStructure, 0) });
  
      this.floatDamageText(adjustedDamage,finalType);
  
      if (newStructure <= 0) {
  
        const token = this.getActiveTokens()[0];
  
        if (token) {
  
  
          let combatant = token.combatant;
  
          if (!combatant && game.combat) {
            combatant = game.combat.combatants.find(c => c.tokenId === token.id);
          }
  
          if (combatant) {
            await combatant.update({ defeated: true });
  
            // Activar condición "muerto" usando Actor.toggleStatusEffect
            const deadStatus = CONFIG.statusEffects.find(e => e.id === "dead");
            if (deadStatus) {
              await this.toggleStatusEffect(deadStatus.id, { active: true });
            }
          }
        }
      }
  
      return;
    }
  
    // 4. SWARM o VEHICLE tipo SWARM
    if (this.type === "swarm" || (isVehicle && actorType === "swarm")) {
      const [armorBase, armorType, resistBase] = this.getArmor();
      const unitType = this.type === "swarm" ? "L" : normalizeArmorType(this.system.scale);
  
      let units = this.system.units || 0;
      const wounds = this.system.wounds || 1;
  
      let damageRemaining = rawDamage;
      let destroyed = 0;
  
      const isSameScale = damageType === armorType;
  
      for (let i = 0; i < units; i++) {
        if (damageRemaining <= 0) break;
  
        // Penetración y resist (solo si escala coincide)
        const effectivePen = isSameScale ? selectedPen : 0;
        const effectiveResist = isSameScale ? resistBase : 0;
        const effectiveArmor = Math.max(armorBase - Math.max(effectivePen - effectiveResist, 0), 0);
        const costToKill = effectiveArmor + wounds;
  
        // Determinar tipo final y conversión
        let finalType = damageType;
        let costInOriginalScale = costToKill;
  
        if (damageType === "M" && unitType === "L") {
          finalType = "L";
          costInOriginalScale = costToKill / 10;
        } else if (damageType === "N" && unitType === "M") {
          finalType = "M";
          costInOriginalScale = costToKill / 10;
        } else if (damageType === "L" && unitType === "M") {
          finalType = "M";
          costInOriginalScale = costToKill * 10;
        } else if (damageType === "M" && unitType === "N") {
          finalType = "N";
          costInOriginalScale = costToKill * 10;
        } else if (
          (damageType === "L" && unitType === "N") ||
          (damageType === "N" && unitType === "L")
        ) {
          continue; // daño incompatible, no se puede dañar
        }
  
        if (damageRemaining >= costInOriginalScale) {
          destroyed++;
          damageRemaining -= costInOriginalScale;
        } else {
          break; // no alcanza para destruir otra unidad
        }
      }
  
      const newUnits = Math.max(units - destroyed, 0);
      await this.update({ "system.units": newUnits });
  
      if (newUnits <= 0) {
        const token = this.getActiveTokens()[0];
        if (token?.combatant) {
          await token.combatant.update({ defeated: true });
          await this.toggleStatusEffect("dead", { active: true });
        }
      }
  
      // Mostrar texto flotante con número de unidades destruidas
      this.floatDamageText(`${destroyed}💀`, damageType);
      return;
    }
  
  
    // Otros casos no contemplados aún
    console.warn(`applyDamage: tipo de actor no reconocido para ${this.name}`);
  };
  
  function getRayThickness(target) {
    const actorType = target?.actor?.type;
    const isVehicle = actorType === "vehicle";
  
    // Para vehículos, usamos el tipo de armadura
    if (isVehicle) {
      const armorType = target.actor.getArmorType(); // usa tu método existente
      if (armorType === "N") return 6;
      if (armorType === "M") return 4;
      return 2; // Asumimos "L" como valor base
    }
  
    // Para actores no-vehículo
    return 2;
  }
  
  function launchBeamEffect(sourceToken, targetToken) {
   /* const thickness = getRayThickness(targetToken); No funciona el módulo
    if (typeof Sequence === "undefined") {
      ui.notifications.warn("El módulo JB2A no está disponible o no se ha cargado.");
    } else {
    new Sequence()
      .effect()
      .atLocation(sourceToken)
      .stretchTo(targetToken)
      .file("jb2a.lightning_bolt.blue") // o cualquier efecto de rayo que tengas
      .scale(thickness / 2) // los archivos .webm de rayos suelen escalar de 0.5 a 3.0
      .play();
    }*/
  }
  
  Hooks.on("renderChatMessage", async (message, html, data) => {
    const button = html.find(".apply-damage-button");
    if (button.length === 0) return;
    button.on("click", async () => {
/*        const messageId = button.closest(".message")?.dataset.messageId;
        const msg = game.messages.get(messageId);
        const assistUsed = msg?.getFlag("ad6_robotech", "assistUsed") || 0;
        const totalSuccesses = msg?.getFlag("ad6_robotech", "successes") || 0;
        const finalSuccesses = totalSuccesses + assistUsed;*/

      // successes = parseInt(button.data("successes"));
  
      

      // Obtener el mensaje de chat desde el botón
      //const messageId = message.id;
      //const msg = game.messages.get(messageId);
    
      
      const assistUsed = message?.getFlag("ad6_robotech", "assistUsed") || 0;
      const successes = parseInt(button.data("successes")) +  assistUsed;

      // Obtener actor activo
      let actor = game.user.character;
      if (!actor && canvas.tokens.controlled.length > 0) {
          actor = canvas.tokens.controlled[0].actor;
      }
  
      const targets = Array.from(game.user.targets);
      if (!actor || targets.length === 0) {
          ui.notifications.warn("Se requiere un actor activo y un objetivo seleccionado.");
          return;
      }
  
      const target = targets[0].actor;
  
      // Obtener armadura, tipo y resist del objetivo
      const [baseArmor, armorType, resist] = target.getArmor();
  
      // Obtener armas del actor
      //let weapons = actor.items.filter(item => item.type === "gear");
      let gears = actor.items.filter(item => item.type === "gear");
  let suitesWithDamage = actor.items.filter(item =>
      item.type === "equipmentsuite" && item.system.damage && item.system.damage.trim() !== ""
  );
  
  let weapons = [...gears, ...suitesWithDamage];
  
      // Arma "Ninguno"
      const noneWeapon = {
          id: "none",
          name: "Ninguno",
          type: "gear",
          system: {
              range: "",
              damage: "1",
              pen: "",
              aoe: "",
              ext: ""
          }
      };
  
      weapons = [...weapons, noneWeapon];
  
      const activeSuite = actor.items.find(item =>
        item.type === "equipmentsuite" &&
        item.system?.stack === true &&
        item.system?.damage?.trim() !== ""
    );
    const defaultWeaponId = activeSuite ? activeSuite.id : "none";
  
      const optionsHtml = weapons.map(w => {
        const data = w.system;
        const selected = (w.id === defaultWeaponId) ? "selected" : "";
        return `<option value="${w.id}" ${selected}>
            ${w.name} | Rango: ${data.range} | Daño: ${data.damage} | Pen: ${data.pen} | AoE: ${data.aoe} | Ext: ${data.ext}
        </option>`;
    }).join("");
  
      const content = `
          <form style="background: #2e2e2e; color: #f0f0f0; padding: 10px; border-radius: 8px;">
            <div style="margin-bottom: 10px; font-weight: bold; color: #ddd; background: #444; padding: 5px; border-radius: 5px;">
                ⚔️ Atacante: <strong>${actor.name}</strong>
            </div>
            <div style="margin-bottom: 10px; font-weight: bold; color: #ddd; background: #444; padding: 5px; border-radius: 5px;">
                🎯 Objetivo: <strong>${target.name}</strong>
            </div>
            <div class="form-group">
                <label style="color: #f0f0f0;">Selecciona un arma:</label>
                <div style="position: relative;">
                  <select id="weapon-select" class="ad6-dark-select">
                    ${optionsHtml}
                  </select>
                  <div style="position: absolute; top: 8px; right: 10px; pointer-events: none; color: #ccc;">▼</div>
                </div>
            </div>
  
            <div class="form-group" style="margin-top:10px;">
                <label style="color: #f0f0f0;">Defensa del objetivo:</label>
                <input id="target-defense" type="number" value="0" style="background-color: #333; color: #f0f0f0;" />
            </div>
  
            <div class="form-group" style="margin-top:10px;">
                <label style="color: #f0f0f0;">Armadura del objetivo:</label>
                <input type="text" value="${baseArmor} (${armorType}) [Res:${resist}]" disabled style="background-color: #333; color: #f0f0f0;" />
            </div>
        </form>
      `;
  
      new Dialog({
          title: "Seleccionar Arma y Datos de Defensa",
          content,
          buttons: {
              confirm: {
                  icon: "<i class='fas fa-check'></i>",
                  label: "Aplicar daño",
                  callback: async (html) => {
                      const selectedId = html.find("#weapon-select").val();
                      const defense = parseInt(html.find("#target-defense").val()) || 0;
  
                      const weapon = weapons.find(w => w.id === selectedId);
                      if (!weapon) {
                          ui.notifications.error("No se pudo encontrar el arma seleccionada.");
                          return;
                      }
  
                      // Calcular éxitos netos
                      const effectiveSuccesses = Math.max(successes - defense, 0);
                      const damageFormula = weapon.system.damage.trim().toUpperCase();
  
                      let damageType = "";
                      let damagePerSuccess = 1;
  
                      const regex = /^(\d+)?\s*(?:X)?\s*([LMN])$/i;
                      const match = damageFormula.match(regex);
  
                      if (match) {
                          damagePerSuccess = parseInt(match[1]) || 1;
                          damageType = match[2];
                      }
  
                      const typeOrder = { "L": 0, "M": 1, "N": 2 };
  
                      // Determina si el arma tiene mayor escala que la armadura
                      const overkill = typeOrder[damageType] > typeOrder[armorType];
  
                      let rawDamage = effectiveSuccesses * damagePerSuccess;
  
                      // PENETRACIÓN
                      function parsePenetration(penField) {
                          const pen = (penField || "").trim().toUpperCase();
                          const regex = /^P(\d+)(?:\|(\d+))?$/i;
                          const match = pen.match(regex);
                          if (!match) return { values: [0], multiple: false };
                          const x = parseInt(match[1]);
                          const y = match[2] ? parseInt(match[2]) : null;
                          return {
                              values: y !== null ? [x, y] : [x],
                              multiple: y !== null
                          };
                      }
  
                      const penParsed = parsePenetration(weapon.system.pen || "");
                      let selectedPen = 0;
  
                      if (penParsed.multiple) {
                          selectedPen = await new Promise(resolve => {
                              new Dialog({
                                  title: "Seleccionar penetración de armadura",
                                  content: `
                                      <form style="background: #2e2e2e; color: #f0f0f0; padding: 10px; border-radius: 8px;">
                                        <div class="form-group">
                                            <label style="color: #f0f0f0;">Selecciona el valor de penetración:</label>
                                            <select id="pen-value" class="ad6-dark-select">
                                                ${penParsed.values.map(v => `<option value="${v}">${v}</option>`).join("")}
                                            </select>
                                        </div>
                                    </form>
                                  `,
                                  buttons: {
                                      ok: {
                                          label: "Aceptar",
                                          callback: html => {
                                              const val = parseInt(html.find("#pen-value").val());
                                              resolve(val);
                                          }
                                      }
                                  },
                                  default: "ok",
                                  close: () => resolve(penParsed.values[0]),
                                  render: html => {
                                    html.closest('.app').addClass('ad6-damage-dialog');
                                  }
                              }).render(true);
                          });
                      } else {
                          selectedPen = penParsed.values[0];
                      }
  
                      // Aplicar RESISTENCIA sobre penetración
                      const effectivePen = Math.max(selectedPen - resist, 0);
  
                      // Aplicar penetración a armadura
                      let armor = Math.max(baseArmor - effectivePen, 0);
  
                      // Cálculo de daño ajustado según tipo
  
                      const { adjustedDamage, finalType, residual } = convertAndApplyArmor(damageType, rawDamage, armorType, armor);
                      
                      const isVehicle = target.type === "vehicle";
                      const targetType = isVehicle ? target.system.type : target.type;
                      const isSwarm = targetType === "swarm";
  
                      // Mensaje en el chat
                      let chatText = "";
  
                      if (isSwarm) {
                          chatText = `
                          <p>💥 El objetivo (swarm) recibe <strong>${rawDamage}</strong> puntos de daño tipo <strong>${damageType}</strong>.</p>
                          <details style="margin-top: 5px;">
                            <summary style="cursor:pointer; color: #666;">📊 Ver detalle del cálculo</summary>
                            <div style="padding-left: 10px; font-size: 0.9em;">
                              <p>🎲 Éxitos netos: <strong>${effectiveSuccesses}</strong></p>
                              <p>📌 Multiplicador del arma: <strong>${damagePerSuccess}</strong></p>
                              <p>💣 Daño base: <strong>${rawDamage}</strong> (${damageType})</p>
                            </div>
                          </details>
                          `;
                      } else {
                          chatText = `
                          <p>💥 El objetivo recibe <strong>${adjustedDamage}</strong> puntos de daño tipo <strong>${finalType}</strong>.</p>
                          ${(finalType === "M" && residual > 0) ? `<p>⚠️ Daño residual: <strong>${residual}</strong> puntos de tipo <strong>L</strong>.</p>` : ""}
                          ${(finalType === "N" && residual > 0) ? `<p>⚠️ Daño residual: <strong>${residual}</strong> puntos de tipo <strong>M</strong>.</p>` : ""}
  
                          <details style="margin-top: 5px;">
                            <summary style="cursor:pointer; color: #666;">📊 Ver detalle del cálculo</summary>
                            <div style="padding-left: 10px; font-size: 0.9em;">
                              <p>🎲 Éxitos netos: <strong>${effectiveSuccesses}</strong></p>
                              <p>📌 Multiplicador del arma: <strong>${damagePerSuccess}</strong></p>
                              <p>💣 Daño base: <strong>${rawDamage}</strong> (${damageType})</p>
                              <p>🛡️ Penetración del arma: <strong>${selectedPen}</strong></p>
                              <p>🧬 Resist del objetivo: <strong>${resist}</strong></p>
                              <p>🧱 Armadura efectiva: <strong>${armor}</strong> (${armorType})</p>
                              <p>🔁 Conversión a tipo final: <strong>${finalType}</strong></p>
                              <p>✅ Daño final aplicado: <strong>${adjustedDamage}</strong></p>
                              ${(residual > 0) ? `<p>⚠️ Daño residual sin convertir: <strong>${residual}</strong></p>` : ""}
                            </div>
                          </details>
                          `;
                      }
  
                      ChatMessage.create({
                        speaker: ChatMessage.getSpeaker(),
                        content: chatText
                    });
                      
  
                      // Llamar a applyDamage
                    /* if (target && typeof target.applyDamage === "function") {
                          await target.applyDamage(adjustedDamage, damageType, rawDamage, residual, finalType, selectedPen, overkill,actor);
                      } else {
                          ui.notifications.warn("El objetivo no puede recibir daño (falta applyDamage).");
                      }*/
                          
                          const macro = game.macros.getName("ad6ApplyDamage");
                          if (!macro) {
                            ui.notifications.error("No se encontró la macro 'ad6ApplyDamage'. Asegúrate de que esté creada y compartida.");
                            return;
                          }
                          
                          await macro.execute({
                            targetTokenId: target.token.id,
                            adjustedDamage,
                            damageType,
                            rawDamage,
                            residual,
                            finalType,
                            selectedPen,
                            overkill
                          });                         

                  }
              },
              cancel: {
                  label: "Cancelar"
              }
          },
          default: "confirm",
          render: html => {
            html.closest('.app').addClass('ad6-damage-dialog');
            
          }
      }).render(true);
  });
  
  
  });
  