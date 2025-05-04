/* swarm visual*/
// swarm-units-visual.js

const getProperty = foundry.utils.getProperty;
const hasProperty = foundry.utils.hasProperty;

/**
 * Hook que actualiza la visualización del número de unidades para actores tipo swarm.
 */
Hooks.on("updateActor", (actor, changes, options, userId) => {
  console.log("⚙️ updateActor hook activado", changes);
  if (!isSwarmActor(actor)) return;

  if (hasProperty(changes, "system.units")) {
    for (const token of actor.getActiveTokens()) {
      updateSwarmUnitsDisplay(token);
    }
  }
});

/**
 * Hook que agrega el texto al crearse un nuevo token
 */
Hooks.on("createToken", (tokenDocument) => {
  const token = tokenDocument.object;
  if (!token || !token.actor) return;

  if (isSwarmActor(token.actor)) {
    token.once("render", () => updateSwarmUnitsDisplay(token));
  }
});

/**
 * Hook que actualiza visualmente todos los tokens swarm al cargar el canvas
 */
Hooks.on("canvasReady", () => {
  console.log("🌐 canvasReady — verificando tokens existentes");

  for (const token of canvas.tokens.placeables) {
    if (isSwarmActor(token.actor)) {
      updateSwarmUnitsDisplay(token);
    }
  }
});

/**
 * Hook para recibir actualización por socket
 */
Hooks.on("ready", () => {
  console.log("------------------>ready");
  game.socket.on("module.ad6-sync", (data) => {
    if (data.type === "update-units-display") {
      const scene = game.scenes.get(data.sceneId);
      const token = scene?.tokens.get(data.tokenId)?.object;
      console.log("------------------>");
      console.log(token);
      if (token) updateSwarmUnitsDisplay(token);
    }
  });
});

/**
 * Actualiza el número visual en el token
 * @param {Token} token
 */
function updateSwarmUnitsDisplay(token) {
  console.log("⛳ Ejecutando updateSwarmUnitsDisplay con token:", token);
  const actor = token.actor;
  if (!actor) {
    console.warn("Token sin actor", token);
    return;
  }

  if (!isSwarmActor(actor)) return;

  const units = getProperty(actor.system, "units") ?? 0;

  // Borra texto anterior si existe
  if (token._unitsText) {
    token.removeChild(token._unitsText);
  }

  const text = new PIXI.Text(units.toString(), {
    fontFamily: "Roboto",
    fontSize: 24 * 1.3, // 30% más grande
    fill: 0xffffff,
    stroke: 0x000000,
    strokeThickness: 4
  });

  text.anchor.set(1.0, 1.0); // esquina inferior derecha
  text.x = token.w;
  text.y = token.h;

  token._unitsText = text;
  token.addChild(text);

  if (game.user.isGM) {
    game.socket.emit("module.ad6-sync", {
      type: "update-units-display",
      tokenId: token.id,
      sceneId: token.scene.id
    });
  }
}

/**
 * Determina si un actor es tipo swarm (directo o como vehículo swarm)
 * @param {Actor} actor
 * @returns {boolean}
 */
function isSwarmActor(actor) {
  console.log("Verificando tipo de actor:", actor.type, actor.system?.type);
  return actor?.type === "swarm" || (actor?.type === "vehicle" && getProperty(actor.system, "type") === "swarm");
}

/* swarm visual */