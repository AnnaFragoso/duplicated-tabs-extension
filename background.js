chrome.runtime.onInstalled.addListener(() => {

  chrome.sidePanel.setPanelBehavior({
    openPanelOnActionClick: true
  });

});

async function saveThumbnail(tabId) {

  try {

    const dataUrl = await chrome.tabs.captureVisibleTab(
      undefined,
      {
        format: "jpeg",
        quality: 50
      }
    );

    const storage =
      await chrome.storage.local.get("thumbnails");

    const thumbnails =
      storage.thumbnails || {};

    thumbnails[tabId] = dataUrl;

    await chrome.storage.local.set({
      thumbnails
    });

  } catch (err) {
    console.log("Erro ao capturar thumbnail", err);
  }
}

chrome.tabs.onActivated.addListener(async (activeInfo) => {

  saveThumbnail(activeInfo.tabId);

});

chrome.tabs.onUpdated.addListener(async (
  tabId,
  changeInfo,
  tab
) => {

  if (
    changeInfo.status === "complete" &&
    tab.active
  ) {

    saveThumbnail(tabId);
  }
});