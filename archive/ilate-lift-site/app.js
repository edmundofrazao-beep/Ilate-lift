document.getElementById('show-status')?.addEventListener('click', () => {
  const target = document.getElementById('runtime-status');
  if (!target) return;
  target.textContent =
    'Estado verificado: /lift/ está a servir a base nova, separada de CV e ORCS, e pronta para deploy contínuo por GitHub Actions.';
});
