document.addEventListener('DOMContentLoaded', () => {
  // --- Initialization & Setup ---
  initTheme();
  initDirection();
  initMobileMenu();
  initDropdowns();
  initAccordions();
  initTabs();
  initFormValidation();
  initSkeletonLoaders();
  lucide.createIcons(); // Initialize Lucide Icons
});

// --- Theme Management (Light/Dark Mode) ---
function initTheme() {
  const themeToggles = document.querySelectorAll('.theme-toggle');
  
  // Set initial theme
  const savedTheme = localStorage.getItem('theme');
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const initialTheme = savedTheme || (systemPrefersDark ? 'dark' : 'light');
  
  setTheme(initialTheme);
  
  themeToggles.forEach(toggle => {
    toggle.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      setTheme(newTheme);
    });
  });

  // Listen for system theme changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    if (!localStorage.getItem('theme')) {
      setTheme(e.matches ? 'dark' : 'light');
    }
  });
}

function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
  
  // Update icons if toggle has icon nodes
  const themeToggles = document.querySelectorAll('.theme-toggle');
  themeToggles.forEach(toggle => {
    const icon = toggle.querySelector('i');
    if (icon) {
      if (theme === 'dark') {
        icon.setAttribute('data-lucide', 'sun');
      } else {
        icon.setAttribute('data-lucide', 'moon');
      }
    }
  });
  if (window.lucide) lucide.createIcons();
}

// --- Direction Management (LTR/RTL) ---
function initDirection() {
  const dirToggles = document.querySelectorAll('.dir-toggle');
  const savedDir = localStorage.getItem('dir') || 'ltr';
  
  setDirection(savedDir);
  
  dirToggles.forEach(toggle => {
    toggle.addEventListener('click', () => {
      const currentDir = document.documentElement.getAttribute('dir') || 'ltr';
      const newDir = currentDir === 'ltr' ? 'rtl' : 'ltr';
      setDirection(newDir);
    });
  });
}

function setDirection(dir) {
  document.documentElement.setAttribute('dir', dir);
  localStorage.setItem('dir', dir);

  // Update button texts/states if applicable
  const dirToggles = document.querySelectorAll('.dir-toggle span');
  dirToggles.forEach(span => {
    span.textContent = dir === 'ltr' ? 'RTL' : 'LTR';
  });
}

// --- Mobile Navigation Menu ---
function initMobileMenu() {
  const hamburger = document.querySelector('.hamburger');
  const navMenu = document.querySelector('.nav-menu');
  
  if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
      navMenu.classList.toggle('active');
      const icon = hamburger.querySelector('i');
      if (icon) {
        const isOpen = navMenu.classList.contains('active');
        icon.setAttribute('data-lucide', isOpen ? 'x' : 'menu');
        lucide.createIcons();
      }
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!hamburger.contains(e.target) && !navMenu.contains(e.target) && navMenu.classList.contains('active')) {
        navMenu.classList.remove('active');
        const icon = hamburger.querySelector('i');
        if (icon) {
          icon.setAttribute('data-lucide', 'menu');
          lucide.createIcons();
        }
      }
    });
  }
}

// --- Accessible Dropdowns (Keyboard support) ---
function initDropdowns() {
  const dropdowns = document.querySelectorAll('.nav-dropdown');

  function closeAllDropdowns() {
    dropdowns.forEach(dropdown => {
      dropdown.classList.remove('open');
      const menu = dropdown.querySelector('.dropdown-menu');
      const trigger = dropdown.querySelector('.nav-link, .profile-btn');
      if (menu) menu.style.display = 'none';
      if (trigger) trigger.setAttribute('aria-expanded', 'false');
    });
  }

  dropdowns.forEach(dropdown => {
    const trigger = dropdown.querySelector('.nav-link, .profile-btn');
    const menu = dropdown.querySelector('.dropdown-menu');

    if (!trigger || !menu) return;

    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      const isOpen = dropdown.classList.toggle('open');
      menu.style.display = isOpen ? 'block' : 'none';
      trigger.setAttribute('aria-expanded', String(isOpen));
    });

    trigger.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const isOpen = dropdown.classList.toggle('open');
        menu.style.display = isOpen ? 'block' : 'none';
        trigger.setAttribute('aria-expanded', String(isOpen));
      }
    });
  });

  document.addEventListener('click', (event) => {
    if (!event.target.closest('.nav-dropdown')) {
      closeAllDropdowns();
    }
  });
}

// --- Accordions (FAQs) ---
function initAccordions() {
  const accordionHeaders = document.querySelectorAll('.accordion-header');
  
  accordionHeaders.forEach(header => {
    header.addEventListener('click', () => {
      const item = header.parentElement;
      const content = header.nextElementSibling;
      const isActive = item.classList.contains('active');
      
      // Close other accordions in the same list
      const siblingItems = item.parentElement.querySelectorAll('.accordion-item');
      siblingItems.forEach(sibling => {
        sibling.classList.remove('active');
        const siblingContent = sibling.querySelector('.accordion-content');
        if (siblingContent) siblingContent.style.maxHeight = null;
      });

      if (!isActive) {
        item.classList.add('active');
        content.style.maxHeight = content.scrollHeight + 'px';
      } else {
        item.classList.remove('active');
        content.style.maxHeight = null;
      }
    });
  });
}

// --- Tab Controls ---
function initTabs() {
  const tabContainers = document.querySelectorAll('.tabs-container');
  
  tabContainers.forEach(container => {
    const tabButtons = container.querySelectorAll('.tab-btn');
    const tabPanels = container.querySelectorAll('.tab-panel');
    
    tabButtons.forEach(button => {
      button.addEventListener('click', () => {
        const targetId = button.getAttribute('data-tab');
        
        tabButtons.forEach(btn => btn.classList.remove('active'));
        tabPanels.forEach(panel => panel.classList.remove('active'));
        
        button.classList.add('active');
        const activePanel = container.querySelector(`#${targetId}`);
        if (activePanel) activePanel.classList.add('active');
      });
    });
  });
}

// --- Dynamic Form Validation (WCAG compliant) ---
function initFormValidation() {
  const forms = document.querySelectorAll('.needs-validation');
  
  forms.forEach(form => {
    form.addEventListener('submit', (e) => {
      let isFormValid = true;
      const inputs = form.querySelectorAll('input, textarea, select');
      
      inputs.forEach(input => {
        const isValid = validateInput(input);
        if (!isValid) {
          isFormValid = false;
        }
      });
      
      if (!isFormValid) {
        e.preventDefault();
        form.classList.add('shake');
        setTimeout(() => form.classList.remove('shake'), 400);
      }
    });

    form.querySelectorAll('input, textarea, select').forEach(input => {
      input.addEventListener('blur', () => validateInput(input));
      input.addEventListener('input', () => {
        if (input.classList.contains('is-invalid')) {
          validateInput(input);
        }
      });
    });
  });
}

function validateInput(input) {
  if (input.type === 'submit' || input.type === 'button') return true;
  
  let isValid = true;
  let errorMessage = '';

  // Check validity using HTML5 validity state
  if (input.required && !input.value.trim()) {
    isValid = false;
    errorMessage = 'This field is required.';
  } else if (input.type === 'email' && input.value) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(input.value)) {
      isValid = false;
      errorMessage = 'Please enter a valid email address.';
    }
  } else if (input.minLength && input.value && input.value.length < input.minLength) {
    isValid = false;
    errorMessage = `Must be at least ${input.minLength} characters.`;
  }
  
  const tooltip = input.parentElement.querySelector('.tooltip');
  
  if (!isValid) {
    input.classList.add('is-invalid');
    input.setAttribute('aria-invalid', 'true');
    if (tooltip) {
      tooltip.textContent = errorMessage;
    }
  } else {
    input.classList.remove('is-invalid');
    input.removeAttribute('aria-invalid');
  }

  return isValid;
}

// --- Skeleton Loaders Fade-In Effect ---
function initSkeletonLoaders() {
  const skeletonWrappers = document.querySelectorAll('.skeleton-wrapper');
  
  skeletonWrappers.forEach(wrapper => {
    // Simulate API fetch delay
    setTimeout(() => {
      const skeletons = wrapper.querySelectorAll('.skeleton');
      skeletons.forEach(s => s.style.display = 'none');
      
      const realContent = wrapper.querySelector('.actual-content');
      if (realContent) {
        realContent.style.display = 'block';
        realContent.style.opacity = 0;
        // Trigger reflow & fade in
        setTimeout(() => {
          realContent.style.transition = 'opacity 0.4s ease';
          realContent.style.opacity = 1;
        }, 50);
      }
    }, 1500);
  });
}
