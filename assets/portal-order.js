/* Keeps the portal's approved community order. */
(() => {
  if (location.pathname.includes('/territories/')) return;

  const normalize = value => value.replace(/\s+/g, ' ').trim().toLocaleLowerCase();
  const approvedOrder = ['palenque', 'rrom', 'yukpa', 'raizal', 'inga', 'cofán'];
  const orderCommunities = container => {
    if (!container) return;
    const buttons = Array.from(container.querySelectorAll('button'));
    const ordered = approvedOrder
      .map(name => buttons.find(button => normalize(button.textContent).includes(name)))
      .filter(Boolean);
    if (ordered.length !== approvedOrder.length || ordered.every((button, index) => buttons[index] === button)) return;
    ordered.forEach(button => container.appendChild(button));
  };

  const update = () => {
    orderCommunities(document.querySelector('.community-map'));
    orderCommunities(document.querySelector('.map-art'));
  };
  [0, 50, 200, 600].forEach(delay => window.setTimeout(update, delay));
})();
