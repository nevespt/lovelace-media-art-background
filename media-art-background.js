function setupStyle(lovelace, bgroundElem) {

  // load config entries
  let transitionOpacity = lovelace.config.media_art_background.transition_opacity || ".5s"; // default -> 2 seconds
  let filterBlur = lovelace.config.media_art_background.blur || '10px'; // default -> blur 10 pixels

  // apply style to background element
  bgroundElem.style.position = "fixed"; // fill entire window
  bgroundElem.style.top = "40px";
  bgroundElem.style.left = 'auto';
  bgroundElem.style.width = "100%";
  bgroundElem.style.height = "100%";
  bgroundElem.style.maxWidth = "100vw";
  bgroundElem.style.maxHeight = "100vh";

  bgroundElem.style.opacity = 0.3;
  bgroundElem.style.transition = "background-image " + transitionOpacity;

  bgroundElem.style.backgroundRepeat = 'no-repeat';
  bgroundElem.style.backgroundPosition = 'center left';
  bgroundElem.style.backgroundSize = 'cover';
  bgroundElem.style.filter = `blur(${filterBlur})`;

  bgroundElem.style.zIndex = -1; // below view elements
}

function setBackground(root, appLayout, lovelace, bgroundElem) {
  const hass = root.hass;

  const viewRoot = appLayout.querySelector("hui-view");

  // We may have initialized too early
  if (!viewRoot) return;

  // load config entries
  let maxOpacity = lovelace.config.media_art_background.opacity || '1'; // default -> fully opaque

  // loop through entities from config
  for (let entity of lovelace.config.media_art_background.entities) {

    // get config attributes or default values
    let entityName = entity.entity || entity;
    let entityValidSource = entity.valid_source || ['Vinyl'];
    let entityImageSource = entity.image_source || 'input_text.coverart';
    let entityValidViews = entity.views; //get a list of valid views
    let currentview = window.location.pathname.substring(window.location.pathname.lastIndexOf('/')+1);

    let entityInfo = hass.states[entityName];
    let entityImageUrl = hass.states[entityImageSource];
    

    if (!entityInfo) {
      console.log(`Couldn't find entity ${entityImageSource}`);
      continue;
    }

    if (!entityValidSource.includes(entityInfo.attributes.source)) continue;

    if (entityValidViews) {
      if (!entityValidViews.includes(currentview)) continue; //if views have been specified check they match the current view
    }


    const backgroundUrl = entityImageUrl.state;
    if (!backgroundUrl) continue;


    bgroundElem.style.backgroundImage = `url('${backgroundUrl}')`


    
    bgroundElem.style.opacity = maxOpacity;

    // disable user background
    viewRoot.style.backgroundImage = 'none';
    viewRoot.style.background = 'transparent';

    return; // abort after first element with valid background
  }

  // restore user background
  viewRoot.removeAttribute('style');
  setupStyle(lovelace, bgroundElem);
};

// get HA root element
let root = document.querySelector("home-assistant");
//root = root.shadowRoot.querySelector("home-assistant-main").shadowRoot.querySelector("app-drawer-layout partial-panel-resolver ha-panel-lovelace").shadowRoot.querySelector("hui-root");
root = root.shadowRoot.querySelector("home-assistant-main").shadowRoot.querySelector("ha-drawer partial-panel-resolver ha-panel-lovelace").shadowRoot.querySelector("hui-root");

// get constant elements from HA root element
//const appLayout = root.shadowRoot.querySelector("ha-app-layout");
const appLayout = root.shadowRoot.querySelector("div");
const lovelace = root.lovelace;

// create container element, set style and append to container
const bgroundElem = document.createElement("div"); // create empty container for background 
setupStyle(lovelace, bgroundElem);
appLayout.appendChild(bgroundElem);
//appLayout.shadowRoot.querySelector("hui-view").style.transform = "none";
//appLayout.shadowRoot.querySelector("#contentContainer").style.transform = "none";

setInterval(function () { setBackground(root, appLayout, lovelace, bgroundElem) }, 5000);
setBackground(root, appLayout, lovelace, bgroundElem);
