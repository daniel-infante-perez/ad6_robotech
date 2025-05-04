// ad6_assist_pool.mjs
globalThis.renderAssistOverlay = renderAssistOverlay;

Hooks.once("ready", () => {
  if (!game.ad6_assistPools) {
    game.ad6_assistPools = {}; // { actorId: number }
  }
});

// Limpia overlays y estructura al cambiar de ronda
Hooks.on("combatRound", () => {
  document.querySelectorAll(".assist-overlay").forEach(el => el.remove());
  game.ad6_assistPools = {};
});

export function renderAssistOverlay(actorId, value) {
  const div = document.createElement("div");
  div.className = "assist-overlay";
  div.dataset.actorId = actorId;
  div.style.position = "fixed";
  div.style.left = "20px";
  div.style.top = `${100 + Object.keys(game.ad6_assistPools).indexOf(actorId) * 60}px`;
  div.style.zIndex = 100;
  div.style.cursor = "move";
  div.innerHTML = `
    <div class="assist-box" style="background: #222; color: white; padding: 8px; border: 1px solid #888; border-radius: 8px;">
      <span class="assist-name">${game.actors.get(actorId)?.name || "Desconocido"}</span>: 
      <span class="assist-value">${value}</span>
      <button class="use-assist" data-amount="1">+1</button>
      <button class="close-assist" title="Cerrar" style="margin-left: 10px;">❌</button>
    </div>`;

  document.body.appendChild(div);

  // Movimiento libre
  let offsetX, offsetY;
  div.addEventListener("mousedown", e => {
    if (!e.target.closest(".assist-box")) return;
    offsetX = e.clientX - div.offsetLeft;
    offsetY = e.clientY - div.offsetTop;
    function onMouseMove(e) {
      div.style.left = `${e.clientX - offsetX}px`;
      div.style.top = `${e.clientY - offsetY}px`;
    }
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", () => {
      document.removeEventListener("mousemove", onMouseMove);
    }, { once: true });
  });

  // Cierre
  div.querySelector(".close-assist").addEventListener("click", () => {
    div.remove();
    delete game.ad6_assistPools[actorId];
  });

  // Consumo
  div.querySelector(".use-assist").addEventListener("click", async e => {
    const amount = parseInt(e.currentTarget.dataset.amount);
    const poolValue = game.ad6_assistPools[actorId];
  
    if (!poolValue || poolValue < amount) {
      ui.notifications.warn("No hay suficientes éxitos disponibles.");
      return;
    }
  
    // Actualización local inmediata
    const newVal = poolValue - amount;
    game.ad6_assistPools[actorId] = newVal;
  
    const valSpan = div.querySelector(".assist-value");
    if (valSpan) valSpan.textContent = newVal;
    if (newVal <= 0) div.remove();
  
    // Modificar mensaje local del consumidor
    const lastMsg = [...game.messages].reverse().find(m =>
      m.author?.id === game.user.id &&
      m.flags?.["ad6_robotech"]?.successes != null
    );
  
    if (lastMsg) {
      const extra = (lastMsg.flags["ad6_robotech"].assistUsed || 0) + amount;
      const totalOriginal = lastMsg.flags["ad6_robotech"].successes || 0;
      const newTotal = totalOriginal + extra;
  
      const newContent = lastMsg.content.replace(
        /(<strong>)(\d+)(<\/strong>)([^<]*)/i,
        (_, pre, val, post, suffix) => `${pre}${newTotal}${post}${suffix}`
      );
  
      await lastMsg.update({
        flags: {
          ...lastMsg.flags,
          "ad6_robotech": {
            ...lastMsg.flags["ad6_robotech"],
            assistUsed: extra
          }
        },
        content: newContent
      });
    }
  
    // 🔁 NUEVO: Propagación del consumo a todos
    ChatMessage.create({
      content: "", // mensaje oculto
      whisper: game.users.contents.map(u => u.id),
      flags: {
        ad6_robotech: {
          assistConsumed: true,
          actorId,
          newValue: newVal
        }
      }
    });
  });
  
}
