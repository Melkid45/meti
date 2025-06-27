export const SetVH = () => {
  const setViewportUnits = () => {
    const vh = window.innerHeight * 0.01;
    const dvh = window.visualViewport?.height * 0.01 || vh;
    const svh = Math.min(window.innerHeight, screen.height) * 0.01;
    const lvh = Math.max(window.innerHeight, screen.height) * 0.01;

    document.documentElement.style.setProperty('--vh', `${vh}px`);
    document.documentElement.style.setProperty('--dvh', `${dvh}px`);
    document.documentElement.style.setProperty('--svh', `${svh}px`);
    document.documentElement.style.setProperty('--lvh', `${lvh}px`);
  };

  setViewportUnits();

  window.addEventListener('resize', setViewportUnits);
};