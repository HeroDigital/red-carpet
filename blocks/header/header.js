import { getMetadata } from "../../scripts/aem.js";
import { loadFragment } from "../fragment/fragment.js";

// media query match that indicates mobile/tablet width
const isDesktop = window.matchMedia("(min-width: 1024px)");

function closeOnEscape(e) {
  if (e.code === "Escape") {
    const nav = document.getElementById("nav");
    const navSections = nav.querySelector(".nav-sections");
    const navSectionExpanded = navSections.querySelector(
      '[aria-expanded="true"]'
    );
    if (navSectionExpanded && isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleAllNavSections(navSections);
      navSectionExpanded.focus();
    } else if (!isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleMenu(nav, navSections);
      nav.querySelector("button").focus();
    }
  }
}

function openOnKeydown(e) {
  const focused = document.activeElement;
  const isNavDrop = focused.className === "nav-drop";
  if (isNavDrop && (e.code === "Enter" || e.code === "Space")) {
    const dropExpanded = focused.getAttribute("aria-expanded") === "true";
    // eslint-disable-next-line no-use-before-define
    toggleAllNavSections(focused.closest(".nav-sections"));
    focused.setAttribute("aria-expanded", dropExpanded ? "false" : "true");
  }
}

function focusNavSection() {
  document.activeElement.addEventListener("keydown", openOnKeydown);
}

/**
 * Toggles all nav sections
 * @param {Element} sections The container element
 * @param {Boolean} expanded Whether the element should be expanded or collapsed
 */
function toggleAllNavSections(sections, expanded = false) {
  sections
    .querySelectorAll(".nav-sections .default-content-wrapper > ul > li")
    .forEach((section) => {
      section.setAttribute("aria-expanded", expanded);
    });
}

/**
 * Toggles the entire nav
 * @param {Element} nav The container element
 * @param {Element} navSections The nav sections within the container element
 * @param {*} forceExpanded Optional param to force nav expand behavior when not null
 */
function toggleMenu(nav, navSections, forceExpanded = null) {
  const expanded =
    forceExpanded !== null
      ? !forceExpanded
      : nav.getAttribute("aria-expanded") === "true";
  const button = nav.querySelector(".nav-hamburger button");
  document.body.style.overflowY = expanded || isDesktop.matches ? "" : "hidden";
  nav.setAttribute("aria-expanded", expanded ? "false" : "true");
  button.setAttribute(
    "aria-label",
    expanded ? "Open navigation" : "Close navigation"
  );
  // enable nav dropdown keyboard accessibility
  const navDrops = navSections.querySelectorAll(".nav-drop");
  if (isDesktop.matches) {
    navDrops.forEach((drop) => {
      if (!drop.hasAttribute("tabindex")) {
        drop.setAttribute("role", "button");
        drop.setAttribute("tabindex", 0);
        drop.addEventListener("focus", focusNavSection);
      }
    });
  } else {
    navDrops.forEach((drop) => {
      drop.removeAttribute("role");
      drop.removeAttribute("tabindex");
      drop.removeEventListener("focus", focusNavSection);
    });
  }
  // enable menu collapse on escape keypress
  if (!expanded || isDesktop.matches) {
    // collapse menu on escape press
    window.addEventListener("keydown", closeOnEscape);
  } else {
    window.removeEventListener("keydown", closeOnEscape);
  }
}

/**
 * decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  // load nav as fragment
  const navMeta = getMetadata("nav");
  const navPath = navMeta ? new URL(navMeta).pathname : "/nav";
  const fragment = await loadFragment(navPath);

  // decorate nav DOM
  const nav = document.createElement("nav");
  nav.id = "nav";
  while (fragment.firstElementChild) nav.append(fragment.firstElementChild);

  const classes = ["brand", "sections", "tools"];
  classes.forEach((c, i) => {
    const section = nav.children[i];
    if (section) section.classList.add(`nav-${c}`);
  });

  const navBrand = nav.querySelector(".nav-brand");
  const brandLink = navBrand.querySelector(".button");
  if (brandLink) {
    const brandText = navBrand.textContent;
    brandLink.className = "nav-logo-link";
    brandLink.innerHTML = `
      <img src="/logos/logo.svg" alt="${brandText}" class="nav-logo" width="135" height="22">
      <span class="visually-hidden">${brandText}</span>
    `;
    brandLink.closest(".button-container").className = "nav-logo-container";
  }

  const navSections = nav.querySelector(".nav-sections");
  if (navSections) {
    navSections
      .querySelectorAll(":scope .default-content-wrapper > ul > li")
      .forEach((navSection) => {
        if (navSection.querySelector("ul")) {
          navSection.classList.add("nav-drop");
          // Wrap the <ul> inside a <div>
          // const ulElement = navSection.querySelector("ul");
          // const divElement = document.createElement("div");
          // divElement.className = "submenu-wrapper";
          // ulElement.parentNode.insertBefore(divElement, ulElement);
          // divElement.appendChild(ulElement);
        }
        if (navSection.classList.contains("nav-drop")) {
          const sectionText = navSection.childNodes[0];
          const divElement = document.createElement("div");
          divElement.classList.add("section-heading");
          divElement.innerHTML = sectionText.textContent;
          sectionText.remove();
          navSection.prepend(divElement);
        }
        navSection.addEventListener("click", () => {
          const expanded = navSection.getAttribute("aria-expanded") === "true";
          toggleAllNavSections(navSections);
          navSection.setAttribute("aria-expanded", expanded ? "false" : "true");
        });
      });
  }

  // hamburger for mobile
  const hamburger = document.createElement("div");
  hamburger.classList.add("nav-hamburger");
  hamburger.innerHTML = `<button type="button" aria-controls="nav" aria-label="Open navigation">
      <span class="nav-hamburger-icon"></span>
    </button>`;
  hamburger.addEventListener("click", () => toggleMenu(nav, navSections));
  nav.prepend(hamburger);
  nav.setAttribute("aria-expanded", "false");
  // prevent mobile nav behavior on window resize
  toggleMenu(nav, navSections, isDesktop.matches);
  isDesktop.addEventListener("change", () =>
    toggleMenu(nav, navSections, isDesktop.matches)
  );

  const navWrapper = document.createElement("div");
  if (isDesktop.matches) {
    navWrapper.innerHTML = `
      <div class="component Header" data-eshop="True">
        <div class="component-content">
          <article class="top-header app-js__top-header">
            <div class="top-header__wrapper">
              <div class="top-header__language-section">
                <div class="top-header__location">
                  <img
                    src="https://www.analog.com/en/_/media/project/analogweb/analogweb/global/location.png?as=0&amp;dmc=0&amp;iar=0&amp;thn=0&amp;udi=0&amp;rev=a637d4413f51432aa5873ae674d6422f&amp;la=en&amp;h=16&amp;w=13&amp;hash=6376F722B24871F4022084B0D4BC30EA"
                    id="Icon-image"
                    alt="location"
                  />
                </div>
                <div
                  class="top-header__language text-underline link-extraSmall"
                  data-toggle="modal"
                  data-target="#languageSelectorModal"
                  tabindex="0"
                  role="button"
                  aria-label="English Click to open a modal and to change language"
                >
                  English
                </div>
                <div class="top-header__currency">USD</div>
              </div>
              <div class="top-header__myanalog-section">
                <div class="top-header__myanalog-icon">
                  <img
                    src="https://www.analog.com/en/_/media/project/analogweb/analogweb/global/myanalog.svg?as=0&amp;dmc=0&amp;iar=0&amp;thn=0&amp;udi=0&amp;rev=c0f5b6da33314165b1378171a85761c9&amp;la=en&amp;h=16px&amp;w=82px&amp;hash=D35DE305084994388CBBCDFF0DED59E7"
                    height="16px"
                    alt="myanalog"
                    width="82px"
                  />
                </div>
                <div class="top-header__login-signup link-extraSmall">
                  <article class="login-button app-js__login-button">
                    <a
                      aria-label="Login"
                      role="link"
                      class="login-button__auth-login hide-onlogin"
                      tabindex="0"
                      >Log In</a
                    ><span class="hide-onlogin"> | </span
                    ><a class="login-button__auth-login hide-onlogin" tabindex="0"
                      >Sign Up</a
                    ><a
                      class="login-button__auth-login"
                      style="display: none"
                      tabindex="0"
                      >Your Account</a
                    >
                  </article>
                </div>
              </div>
            </div>
          </article>
        </div>
      </div>

    `;
  }
  navWrapper.className = "nav-wrapper";
  navWrapper.append(nav);
  block.append(navWrapper);
}