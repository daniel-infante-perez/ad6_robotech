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
  if (!value || value <= 0) return;

  const div = document.createElement("div");
  div.className = "assist-overlay";
  div.dataset.actorId = actorId;
  div.style.position = "fixed";
  div.style.left = "20px";
  div.style.top = `${100 + Object.keys(game.ad6_assistPools).indexOf(actorId) * 60}px`;
  div.style.zIndex = 100;
  div.style.cursor = "move";

  div.innerHTML = `
    <div class="assist-box" style="background: #222; color: white; padding: 10px; border: 1px solid #888; border-radius: 8px; display: inline-block;">
      <div style="margin-bottom: 6px; font-weight: bold; text-align: center;">
        <span style="margin-right: 6px;">🆘</span>
        <span class="assist-name">${game.actors.get(actorId)?.name || "Desconocido"}</span>: 
        <span class="assist-value" style="font-size: 1.4em; color: #00ffff;">${value}</span>
      </div>
      <div style="display: flex; flex-direction: column; gap: 6px;">
        <button class="use-assist" data-amount="1" style="width: 100%; text-align: center;">Tomar uno <span style="margin-left: 6px;">➕1</span></button>
        <button class="use-assist-all" style="width: 100%; text-align: center;">Tomar todo <span style="margin-left: 6px;">∞</span></button>
        <button class="close-assist" title="Cerrar" style="width: 100%; text-align: center;">Cerrar <span style="margin-left: 6px;">❌</span></button>
      </div>
    </div>`;

  document.body.appendChild(div);

  // Movimiento del overlay
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

  // Botón cerrar
  div.querySelector(".close-assist").addEventListener("click", () => {
    div.remove();
    delete game.ad6_assistPools[actorId];
  });

  // Botón "Tomar uno"
  div.querySelector(".use-assist").addEventListener("click", async e => {
    const amount = parseInt(e.currentTarget.dataset.amount);
    const poolValue = game.ad6_assistPools[actorId];
    if (!poolValue || poolValue < amount) {
      ui.notifications.warn("No hay suficientes éxitos disponibles.");
      return;
    }

    const newVal = poolValue - amount;
    game.ad6_assistPools[actorId] = newVal;

    const valSpan = div.querySelector(".assist-value");
    if (valSpan) valSpan.textContent = newVal;
    if (newVal <= 0) div.remove();

    const lastMsg = [...game.messages].reverse().find(m =>
      m.author?.id === game.user.id && m.flags?.["ad6_robotech"]?.successes != null
    );

    if (lastMsg) {
      const currentDisplayed = parseInt(lastMsg.content.match(/<strong>(\d+)<\/strong>/)?.[1] || "0", 10);
      const newTotal = currentDisplayed + amount;

      const newContent = lastMsg.content.replace(
        /(<strong>)(\d+)(<\/strong>)([^<]*)/i,
        (_, pre, val, post, suffix) => `${pre}${newTotal}${post}${suffix}`
      );

      const previousAssistUsed = lastMsg.flags["ad6_robotech"].assistUsed || 0;

      await lastMsg.update({
        flags: {
          ...lastMsg.flags,
          "ad6_robotech": {
            ...lastMsg.flags["ad6_robotech"],
            assistUsed: previousAssistUsed + amount
          }
        },
        content: newContent
      });
    }

    const consumer = game.user.character || canvas.tokens.controlled[0]?.actor;
    const actorName = consumer?.name || game.user.name;
    ChatMessage.create({
      content: `<em>${actorName} toma ${amount} del pool de Assist.</em>`,
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

  // Botón "Tomar todo"
  div.querySelector(".use-assist-all").addEventListener("click", async () => {
    const poolValue = game.ad6_assistPools[actorId];
    if (!poolValue || poolValue <= 0) {
      ui.notifications.warn("No hay éxitos restantes.");
      return;
    }

    const amount = poolValue;
    const newVal = 0;
    game.ad6_assistPools[actorId] = newVal;

    const valSpan = div.querySelector(".assist-value");
    if (valSpan) valSpan.textContent = newVal;
    div.remove();

    const lastMsg = [...game.messages].reverse().find(m =>
      m.author?.id === game.user.id && m.flags?.["ad6_robotech"]?.successes != null
    );

    if (lastMsg) {
      const currentDisplayed = parseInt(lastMsg.content.match(/<strong>(\d+)<\/strong>/)?.[1] || "0", 10);
      const newTotal = currentDisplayed + amount;

      const newContent = lastMsg.content.replace(
        /(<strong>)(\d+)(<\/strong>)([^<]*)/i,
        (_, pre, val, post, suffix) => `${pre}${newTotal}${post}${suffix}`
      );

      const previousAssistUsed = lastMsg.flags["ad6_robotech"].assistUsed || 0;

      await lastMsg.update({
        flags: {
          ...lastMsg.flags,
          "ad6_robotech": {
            ...lastMsg.flags["ad6_robotech"],
            assistUsed: previousAssistUsed + amount
          }
        },
        content: newContent
      });
    }

    const consumer = game.user.character || canvas.tokens.controlled[0]?.actor;
    const actorName = consumer?.name || game.user.name;
    ChatMessage.create({
      content: `<em>${actorName} toma ${amount} del pool de Assist.</em>`,
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
