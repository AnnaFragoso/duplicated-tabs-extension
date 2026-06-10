async function loadDuplicateTabs() {

  const tabs = await chrome.tabs.query({});

  const storage =
    await chrome.storage.local.get("thumbnails");

  const thumbnails =
    storage.thumbnails || {};

  const grouped = {};

  tabs.forEach(tab => {

    if (!tab.url) return;

    if (!grouped[tab.url]) {
      grouped[tab.url] = [];
    }

    grouped[tab.url].push(tab);

  });

  const duplicates = Object.entries(grouped)
    .filter(([_, tabs]) => tabs.length > 1);

  renderDuplicates(duplicates, thumbnails);
}

function renderDuplicates(duplicates, thumbnails) {

  const container =
    document.getElementById("duplicates");

  container.innerHTML = "";

  if (duplicates.length === 0) {

    container.innerHTML =
      "<p>Nenhuma aba duplicada encontrada.</p>";

    return;
  }

  duplicates.forEach(([url, tabs]) => {

    const group =
      document.createElement("div");

    group.className = "group";

    const urlElement =
      document.createElement("div");

    urlElement.className = "url";
    urlElement.textContent = url;

    group.appendChild(urlElement);

    tabs.forEach(tab => {

      const tabElement =
        document.createElement("div");

      tabElement.className = "tab";

      // PREVIEW
      if (thumbnails[tab.id]) {

        const preview =
          document.createElement("img");

        preview.src = thumbnails[tab.id];
        preview.className = "preview";

        tabElement.appendChild(preview);

      } else {

        const noPreview =
          document.createElement("div");

        noPreview.className = "no-preview";

        noPreview.innerText =
          "Preview ainda não disponível";

        tabElement.appendChild(noPreview);
      }

      // CONTEÚDO
      const content =
        document.createElement("div");

      content.className = "content";

      const title =
        document.createElement("div");

      title.className = "tab-title";
      title.textContent =
        tab.title || "Sem título";

      // BOTÕES
      const actions =
        document.createElement("div");

      actions.className = "actions";

      const focusBtn =
        document.createElement("button");

      focusBtn.className = "focus-btn";
      focusBtn.innerText = "Abrir";

      focusBtn.onclick = async () => {

        await chrome.tabs.update(
          tab.id,
          { active: true }
        );

        await chrome.windows.update(
          tab.windowId,
          { focused: true }
        );
      };

      const closeBtn =
        document.createElement("button");

      closeBtn.className = "close-btn";
      closeBtn.innerText = "Fechar";

      closeBtn.onclick = async () => {

        await chrome.tabs.remove(tab.id);

        loadDuplicateTabs();
      };

      actions.appendChild(focusBtn);
      actions.appendChild(closeBtn);

      content.appendChild(title);
      content.appendChild(actions);

      tabElement.appendChild(content);

      group.appendChild(tabElement);

    });

    container.appendChild(group);

  });
}

loadDuplicateTabs();