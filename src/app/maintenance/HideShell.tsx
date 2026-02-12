'use client';

import { useEffect } from 'react';

export default function HideShell() {
  useEffect(() => {
    // Add class to body for CSS-based hiding
    document.body.classList.add('maintenance-page');
    
    // Hide Header and Footer from root layout on maintenance page
    // Root layout structure: SmoothScroll > Header, main, Footer
    // Maintenance page footer is inside main, so we hide siblings of main
    const hideElements = () => {
      const main = document.querySelector('main#main-content');
      if (!main) {
        // If main doesn't exist yet, try again
        return;
      }

      const mainParent = main.parentElement;
      if (!mainParent) return;

      // Find header - hide the one that's a sibling to main (from root layout)
      // Skip headers inside main (from maintenance page content)
      const allHeaders = document.querySelectorAll('header');
      allHeaders.forEach((header) => {
        const headerParent = header.parentElement;
        const isSiblingToMain = headerParent === mainParent;
        const isInsideMain = main.contains(header);
        
        // Hide if header is a sibling to main (same parent) and not inside main
        if (isSiblingToMain && !isInsideMain && !header.hasAttribute('data-maintenance-hidden')) {
          header.style.display = 'none';
          header.style.visibility = 'hidden';
          header.setAttribute('data-maintenance-hidden', 'true');
        }
      });

      // Find footer - hide the one that's a sibling to main (from root layout)
      // Keep the footer inside main (from maintenance page)
      const allFooters = document.querySelectorAll('footer');
      allFooters.forEach((footer) => {
        const footerParent = footer.parentElement;
        const isSiblingToMain = footerParent === mainParent;
        const isInsideMain = main.contains(footer);
        
        // Hide if footer is a sibling to main (same parent) and not inside main
        if (isSiblingToMain && !isInsideMain && !footer.hasAttribute('data-maintenance-hidden')) {
          footer.style.display = 'none';
          footer.style.visibility = 'hidden';
          footer.setAttribute('data-maintenance-hidden', 'true');
        }
      });
    };

    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', hideElements);
    } else {
      // DOM is already ready
      hideElements();
    }

    // Also try after delays to catch elements that render later
    const timeoutId = setTimeout(hideElements, 50);
    const timeoutId2 = setTimeout(hideElements, 200);
    const timeoutId3 = setTimeout(hideElements, 1000);

    // Use MutationObserver to catch dynamically added elements
    const observer = new MutationObserver(() => {
      hideElements();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // Cleanup: restore visibility when component unmounts
    return () => {
      document.body.classList.remove('maintenance-page');
      document.removeEventListener('DOMContentLoaded', hideElements);
      clearTimeout(timeoutId);
      clearTimeout(timeoutId2);
      clearTimeout(timeoutId3);
      observer.disconnect();
      
      const hiddenHeaders = document.querySelectorAll('header[data-maintenance-hidden="true"]');
      hiddenHeaders.forEach((header) => {
        const htmlHeader = header as HTMLElement;
        htmlHeader.style.display = '';
        htmlHeader.style.visibility = '';
        htmlHeader.removeAttribute('data-maintenance-hidden');
      });

      const hiddenFooters = document.querySelectorAll('footer[data-maintenance-hidden="true"]');
      hiddenFooters.forEach((footer) => {
        const htmlFooter = footer as HTMLElement;
        htmlFooter.style.display = '';
        htmlFooter.style.visibility = '';
        htmlFooter.removeAttribute('data-maintenance-hidden');
      });
    };
  }, []);

  return null;
}
