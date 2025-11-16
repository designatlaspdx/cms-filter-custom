import './styles/style.css';
console.log('CMS Filter Custom Loader Initialized');

(function(){

const collectionContainerSelector = '[data-collection-container]';
//const itemSelector = '.w-dyn-item ';
const itemSelector = '[data-article-cms-item]';
const yearGroupSelector = '[data-year-group]';
const otherGroupSelector = '[data-other-group]';
const resetBtnSelector = '[filters-reset]';
const noResultsSelector = '[data-no-results]';
const loadMoreBtnSelector = '[load-more-btn]';
const paginationIndicatorSelector = '[pagination-indicator]';

const dataAttrs ={
  year: 'data-year',
  other: 'data-type'
}

// Pagination settings
const itemsPerPage = 6;
let currentPage = 1;
let totalVisibleItems = 0;


//Utility: Get checked values from a checkbox group element

function checkedValues(groupRoot){
  if(!groupRoot) return [];
  return Array.from(groupRoot.querySelectorAll('input[type="checkbox"]:checked')).map(input=>input.value);


}

// The core filter logic
function runFilters(){
  const container = document.querySelector(collectionContainerSelector);
  if(!container) return;

  const items = Array.from(container.querySelectorAll(itemSelector));

  const yearsSelected = checkedValues(document.querySelector(yearGroupSelector));
  const othersSelected = checkedValues(document.querySelector(otherGroupSelector));

  // First pass: determine which items match the filters
  const matchedItems = items.filter(item => {
    const itemYearRaw = item.querySelector(`[${dataAttrs.year}]`).getAttribute(dataAttrs.year) || '';
    const itemOtherRaw = item.querySelector(`[${dataAttrs.other}]`).getAttribute(dataAttrs.other) || '';

    const itemYear = itemYearRaw.split(',').map(v=>v.trim()).filter(Boolean);
    const itemOther = itemOtherRaw.split(',').map(v=>v.trim()).filter(Boolean);
    
    const yearMatches = yearsSelected.length === 0 || itemYear.some(v=> yearsSelected.includes(v));
    const otherMatches = othersSelected.length === 0 || itemOther.some(v=> othersSelected.includes(v));
    
    return yearMatches && otherMatches;
  });

  totalVisibleItems = matchedItems.length;

  // Calculate cumulative load: show items 0 to (currentPage * itemsPerPage)
  const endIdx = currentPage * itemsPerPage;
  const itemsToShow = matchedItems.slice(0, endIdx);  // Always start from 0

  // Second pass: show/hide based on cumulative load with fade animation
  items.forEach(item => {
    const shouldDisplay = itemsToShow.includes(item);
    if (shouldDisplay) {
      // Fade in: show and animate opacity
      if (item.style.display === 'none' || !item.classList.contains('is-active')) {
        // Step 1: Make visible, but let class control opacity
        item.style.display = 'flex';
        // Don't set opacity inline - let the class handle it
        
        // Step 2: Force browser to paint
        requestAnimationFrame(() => {
          // Step 3: Add class which sets opacity via Webflow CSS
          item.classList.add('is-active');
        });
      }
    } else {
      // Fade out: animate opacity then hide
      if (item.classList.contains('is-active')) {
        item.classList.remove('is-active');
        
        // Hide after fade-out completes (matches CSS transition time)
        setTimeout(() => {
          item.style.display = 'none';
        }, 200);
      }
    }
  });

  // Update "x of y" indicator
  const currentShowing = Math.min(endIdx, totalVisibleItems);
  updatePaginationUI(currentShowing, totalVisibleItems);

  // Handle no results message
  const noResultsEl = document.querySelector(noResultsSelector);
  if(noResultsEl){
    noResultsEl.style.display = totalVisibleItems === 0 ? 'block' : 'none';
  }
}

 // debounce helper to avoid rapid runs while clicking fast
  function debounce(fn, wait = 120) {
    let t;
    return function () {
      clearTimeout(t);
      t = setTimeout(fn, wait);
    };
  }

  // Update pagination indicator and Load More button visibility
  function updatePaginationUI(currentShowing, total) {
    const indicator = document.querySelector(paginationIndicatorSelector);
    if (indicator) {
      indicator.textContent = `Showing ${currentShowing} of ${total}`;
    }

    // Hide Load More button if all items are shown
    const loadMoreBtn = document.querySelector(loadMoreBtnSelector);
    if (loadMoreBtn) {
      const hasMore = currentShowing < total;
      loadMoreBtn.style.display = hasMore ? 'flex' : 'none';
    }
  }

  // Handle Load More button click
  function onLoadMoreClick() {
    currentPage++;
    runFilters();
  }
  // Attach listeners for checkboxes
  function attachListeners() {
    const groups = [yearGroupSelector, otherGroupSelector];
    groups.forEach(sel => {
      const root = document.querySelector(sel);
      if (!root) return;
      root.addEventListener('change', debounce(() => {
        currentPage = 1;  // Reset to page 1 when filters change
        runFilters();
      }, 80));
    });

    // reset button
    const resetBtn = document.querySelector(resetBtnSelector);
    if (resetBtn) {
      resetBtn.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelectorAll(`${yearGroupSelector} input[type="checkbox"], ${otherGroupSelector} input[type="checkbox"]`)
          .forEach(cb => cb.checked = false);
        currentPage = 1;  // Reset to page 1
        runFilters();
      });
    }

    // Load More button
    const loadMoreBtn = document.querySelector(loadMoreBtnSelector);
    if (loadMoreBtn) {
      loadMoreBtn.addEventListener('click', onLoadMoreClick);
    }
  }

  //Observe dynamic changes if Webflow re-render the collection list on CMS load
  function observeMutations(){
    const container = document.querySelector(collectionContainerSelector);
    if(!container) return;

    const observer = new MutationObserver(debounce(() =>{
      //re-run and re-attach if needed
      runFilters();
    }, 100));

    observer.observe(container, {childList: true, subtree: true});
  }
  

function init(){
  attachListeners();
  observeMutations();
  runFilters();
  window.addEventListener('load', ()=> setTimeout(runFilters, 250));
}

if(document.readyState === ' loading'){
  document.addEventListener('DOMContentLoaded', init);
} else {
  init(); 
}
})();