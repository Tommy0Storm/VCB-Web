(function(){
  const MOBILE_BREAKPOINT = 1024;
  const dropdownInstances = [];

  const closeDropdown = (instance) => {
    if (!instance) return;
    instance.dropdown.classList.remove('open');
    instance.trigger.setAttribute('aria-expanded', 'false');
  };

  const handleDocumentClick = (event) => {
    if (window.innerWidth > MOBILE_BREAKPOINT) return;
    dropdownInstances.forEach((instance) => {
      if (!instance.dropdown.contains(event.target)) {
        closeDropdown(instance);
      }
    });
  };

  const handleResize = () => {
    if (window.innerWidth > MOBILE_BREAKPOINT) {
      dropdownInstances.forEach(closeDropdown);
    }
  };

  const bindDropdown = (dropdown) => {
    const trigger = dropdown.querySelector(':scope > a, :scope > button');
    const content = dropdown.querySelector('.dropdown-content');
    if (!trigger || !content) return;

    trigger.setAttribute('role', 'button');
    trigger.setAttribute('tabindex', '0');
    trigger.setAttribute('aria-haspopup', 'true');
    trigger.setAttribute('aria-expanded', 'false');

    const handleToggle = (event) => {
      if (window.innerWidth > MOBILE_BREAKPOINT) return;
      event.preventDefault();
      const isOpen = dropdown.classList.toggle('open');
      trigger.setAttribute('aria-expanded', String(isOpen));
    };

    trigger.addEventListener('click', handleToggle);
    trigger.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        handleToggle(event);
      }
    });

    dropdownInstances.push({ dropdown, trigger });
  };

  const initDropdowns = () => {
    const dropdowns = document.querySelectorAll('.dropdown');
    if (!dropdowns.length) return;

    dropdowns.forEach(bindDropdown);
    document.addEventListener('click', handleDocumentClick);
    window.addEventListener('resize', handleResize);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDropdowns);
  } else {
    initDropdowns();
  }
})();
