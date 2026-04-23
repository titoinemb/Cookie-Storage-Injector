// background.js (pour Firefox)

browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action !== "inject") return;

  const { cookies, origins } = message.data;

  // --- Injection des cookies ---
  cookies.forEach(cookie => {
    if (cookie.httpOnly) {
      console.warn(`Ignoré cookie httpOnly: ${cookie.name}`);
      return;
    }

    // Normaliser le domaine et l'URL
    const domain = cookie.domain.replace(/^\./, ""); // supprime le point initial
    const url = (cookie.secure ? "https" : "http") + "://" + domain + "/";

    // Conversion sameSite
    const sameSiteMap = {
      'None': 'no_restriction',
      'Lax': 'lax',
      'Strict': 'strict',
      'Unspecified': 'unspecified'
    };

    const cookieDetails = {
      url,
      name: cookie.name,
      value: cookie.value,
      path: cookie.path || "/",
      secure: cookie.secure || false,
      sameSite: sameSiteMap[cookie.sameSite] || 'unspecified'
    };

    // Ajouter le domain seulement si ce n'est pas un __Host- cookie
    if (!cookie.name.startsWith("__Host-")) {
      cookieDetails.domain = domain;
    }

    // Expiration
    if (cookie.expires != null && cookie.expires !== -1) {
      cookieDetails.expirationDate = Math.floor(cookie.expires / 1000);
    }

    browser.cookies.set(cookieDetails)
      .then(() => {
        console.log(`Cookie ${cookie.name} injecté`);
      })
      .catch(err => {
        console.error(`Impossible d'injecter le cookie ${cookie.name}:`, err);
      });
  });

  // --- Injection du localStorage ---
  origins.forEach(origin => {
    browser.tabs.query({ active: true, currentWindow: true }).then(tabs => {
      if (!tabs || tabs.length === 0) return;

      browser.scripting.executeScript({
        target: { tabId: tabs[0].id },
        func: (localStorageItems) => {
          if (!localStorageItems) return;
          localStorageItems.forEach(item => {
            try {
              localStorage.setItem(item.name, item.value);
            } catch (e) {
              console.error("Erreur localStorage:", e);
            }
          });
        },
        args: [origin.localStorage]
      }).catch(err => console.error("executeScript error:", err));
    });
  });

  sendResponse({ status: "ok" });
  return true; // pour réponse asynchrone
});