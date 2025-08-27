(function () {
  const modal = document.getElementById('pdfModal');
  const iframe = document.getElementById('pdfViewer');
  const fallback = document.getElementById('pdfFallback');
  const openNewTab = document.getElementById('pdfOpenNewTab');
  const dl1 = document.getElementById('pdfDownloadBtn');
  const dl2 = document.getElementById('pdfDownloadBtn2');

  let lastFocusedEl = null;

  // Utility: open modal with a given PDF URL
  function openPdfModal(pdfUrl, title) {
    if (!pdfUrl) return;

    lastFocusedEl = document.activeElement;

    // Set sources
    iframe.src = pdfUrl;
    dl1.href = pdfUrl;
    dl2.href = pdfUrl;
    openNewTab.href = pdfUrl;

    // Optional: set dynamic title if provided
    if (title) {
      const titleEl = document.getElementById('pdfModalTitle');
      titleEl.textContent = title;
    }

    // Reset fallback visibility
    fallback.hidden = true;

    // Show modal
    modal.setAttribute('aria-hidden', 'false');
    modal.style.display = 'flex';

    // Focus first button in header for accessibility
    setTimeout(() => {
      dl1.focus();
    }, 0);
  }

  // Utility: close modal and cleanup
  function closePdfModal() {
    modal.setAttribute('aria-hidden', 'true');
    modal.style.display = 'none';

    // Unload the PDF to stop network/CPU usage
    iframe.src = 'about:blank';

    // Return focus to the button that opened the modal
    if (lastFocusedEl && typeof lastFocusedEl.focus === 'function') {
      lastFocusedEl.focus();
    }
  }

  // Click handlers: any .btn-pdf opens the modal
  document.addEventListener('click', function (e) {
    const btn = e.target.closest('.btn-pdf');
    if (btn) {
      const pdfUrl = btn.getAttribute('data-pdf');
      const title = btn.getAttribute('data-title') || 'Project Document';
      openPdfModal(pdfUrl, title);
    }

    // Close on elements with data-close-modal
    if (e.target.matches('[data-close-modal]')) {
      closePdfModal();
    }
  });

  // Esc to close
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && modal.style.display === 'flex') {
      closePdfModal();
    }
  });

  // Detect if the PDF failed to load (e.g., blocked)
  iframe.addEventListener('error', function () {
    // Show fallback UI if iframe errors
    fallback.hidden = false;
  });

  // Some browsers don’t fire error for PDFs; add a timeout check
  let loadTimeout = null;
  iframe.addEventListener('load', function () {
    // On load, assume OK and clear any timeout
    if (loadTimeout) {
      clearTimeout(loadTimeout);
      loadTimeout = null;
    }
  });
  // Start a timer when src is set (wrap openPdfModal)
  const origOpen = openPdfModal;
  openPdfModal = function(pdfUrl, title){
    fallback.hidden = true;
    origOpen(pdfUrl, title);
    // If load event doesn't fire within 3s, show fallback
    loadTimeout = setTimeout(() => {
      // If modal still open and iframe still pointing at pdfUrl
      if (modal.style.display === 'flex' && iframe.src && iframe.src !== 'about:blank') {
        fallback.hidden = false;
      }
    }, 3000);
  };

  // Optional focus trap (basic)
  modal.addEventListener('keydown', function (e) {
    if (e.key !== 'Tab') return;
    const focusable = modal.querySelectorAll('a[href], button:not([disabled])');
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault(); last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault(); first.focus();
    }
  });
})();