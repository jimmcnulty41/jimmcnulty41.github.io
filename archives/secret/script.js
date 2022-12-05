window.onload = () => {
  setAnim();
  linkImagesToText();
};

const ANIM_1_PATH = "/assets/animation1.png";
const ANIM_2_PATH = "/assets/animation2.png";

const setAnim = () => {
  const anim = document.getElementById("anim");
  const observer = new MutationObserver((mutationsList) => {
    if (mutationsList[0].attributeName !== "class") return;
    anim.src =
      anim.currentSrc.indexOf(ANIM_1_PATH) === -1 ? ANIM_1_PATH : ANIM_2_PATH;
  });
  observer.observe(anim, { attributes: true });
};

const HOVER_CLASS = "linkedHover";

const linkImagesToText = () => {
  const images = document.getElementsByTagName("img");
  const linkedTexts = document.getElementsByClassName("linked");
  for (let i = 0; i < images.length; ++i) {
    const setHover = () => {
      images[i].classList.add(HOVER_CLASS);
      linkedTexts[i].classList.add(HOVER_CLASS);
    };
    const unsetHover = () => {
      images[i].classList.remove(HOVER_CLASS);
      linkedTexts[i].classList.remove(HOVER_CLASS);
    };
    addHoverBehaviorToElement(
      [images[i], linkedTexts[i]],
      setHover,
      unsetHover
    );
  }
};

const isDesktop = () =>
  window.matchMedia("only screen and (min-width: 760px)").matches;

const addHoverBehaviorToElement = (elements, onBehavior, offBehavior) => {
  if (isDesktop()) {
    elements.forEach((element) => {
      element.onmouseenter = onBehavior;
      element.onmouseleave = offBehavior;
    });
  } else {
    elements.forEach((element) => {
      element.ontouchstart = onBehavior;
      element.ontouchend = offBehavior;
    });
  }
};
