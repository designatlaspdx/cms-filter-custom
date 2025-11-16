import './styles/style.css';

console.log("CMS Filter Code Initializd!");

(function (){

  // Selectors for various elements
  const collectionContainerSelector = '[data-collection-container]';
  const itemSelector = '[data-article-cms-item]'; 
  const yearGroupSelector = '[data-year-group]';
  const otherGroupSelector = '[data-other-group]';
  const resetBtnSelector = '[filters-reset]';
  const noResultsSelector = '[data-no-results]';
  const loadMoreBtnSelector = '[load-more-btn]'; 
  const paginationIndicatorSelector = '[pagination-indicator]';

  // Data attribute keys
  const dataAttrs ={
    year: 'data-year',
    other: 'data-type'
  }

  // Pagination Settings
  const itemsPerPage = 6;
  let currentPage = 1;
  let totalVisibleItems = 0;

  // Utility: Get checked values from a checkbox group element
  function checkedValues(groupRoot){
    if(!groupRoot) return [];
    return Array.from(groupRoot.querySelectorAll(`input[type="checkbox"]:checked`)).map(input => input.value);
  }

//Core Filter Logic: Handles filtering and rendering of items based on selected filters and pagination

function runFilters(){

  const container = document.querySelector(collectionContainerSelector);
  if(!container) return;

  const items = Array.from(container.querySelectorAll(itemSelector));


 const yearsSelected = checkedValues(document.querySelector(yearGroupSelector));
  const othersSelected = checkedValues(document.querySelector(otherGroupSelector));

  // First pass: Determine Array of CMS Items that passed the filters
  const matchedItems = items.filter(item =>{
    const itemYearRaw = item.querySelector(`[${dataAttrs.year}]`).getAttribute(dataAttrs.year) || '';
    const itemOtherRaw = item.querySelector(`[${dataAttrs.other}]`).getAttribute(dataAttrs.other) || '';

    const itemYear = itemYearRaw.split(',').map(v=>v.trim()).filter(Boolean);
    const itemOther = itemOtherRaw.split(',').map(v=>v.trim()).filter(Boolean);

    const yearMatches = yearsSelected.length === 0 || itemYear.some( v=> yearsSelected.includes(v));
    const otherMatches = othersSelected.length === 0 || itemOther.some( v=> othersSelected.includes(v));

    return yearMatches && otherMatches;

  });

 
//Calculate cumulative visible items : Show index 0 to (currentPage * itemsPerPage)
  totalVisibleItems = matchedItems.length;
  const endIdx = currentPage * itemsPerPage;

  const itemsToShow = matchedItems.slice(0, endIdx);  // Always start from 0 to endIdx

  // Second Pass: Show/Hide Items based on Pagination in addition to filtered results

  items.forEach( item => {
    const shouldDisplay = itemsToShow.includes(item);

    if(shouldDisplay){
      //Set display property and fade in with css style class
     if(item.style.display ==='none' || !item.classList.contains('is-active')){
      //Step 1: Make sure item is visible, but let class control opacity
      item.style.display = 'flex';

      // Step 2: Force browser to repaint before adding class for fade-in
      requestAnimationFrame(() =>{
        item.classList.add('is-active');
      });

     }
    } else {
      // Fade out: remove class after transition, set display to none
      if(item.classList.contains('is-active')){
        item.classList.remove('is-active');
      }
   
      setTimeout(() =>{
        item.style.display = 'none';
      }, 300); // Match CSS transition duration
    }
  });

  // Update No Results Message Visibliity
  const noResultsEl = document.querySelector(noResultsSelector);
  if(noResultsEl) {
    noResultsEl.style.display = totalVisibleItems === 0 ? 'block' : 'none';
  }

  // Update Pagination UI
  const currentShowing = Math.min(endIdx, totalVisibleItems);
  updatePaginationUI(currentShowing, totalVisibleItems);

}  // End of runFilters function

// Debounce helper to avoid rapid runs while clicking fast
function debounce(fn, wait = 120) {
  let t;

  return function (){
    clearTimeout(t);
    t = setTimeout(fn,wait);
  }

}

// Update Pagination UI Elements (Pagination Indication and Load more button)
function updatePaginationUI(currentShowing, total){
    const indication = document.querySelector(paginationIndicatorSelector);
    if(indication){
      indication.textContent = `Showing ${currentShowing} of ${total}`;
    }

    const loadMoreBtn = document.querySelector(loadMoreBtnSelector);
    if(loadMoreBtn){
      const hasMore = currentShowing < total;
      loadMoreBtn.style.display = hasMore ? 'flex' : 'none';
    }
}


function onLoadMoreClick(){
  currentPage++;
  runFilters();
}

// Attach Event Listeners to Filter Groups and Load More Button
function attachListeners(){
  const groups = [yearGroupSelector, otherGroupSelector];
  groups.forEach( sel =>{
    const root = document.querySelector(sel);
    if(!root) return;

    root.addEventListener('change', debounce(() =>{
      currentPage = 1; //Reset to page one when filter changes
      runFilters();
    }),80);
  });


  // Reset Button
  const resetBtn = document.querySelector(resetBtnSelector);
  if(resetBtn){
    resetBtn.addEventListener('click', function(e){
      // Uncheck all checkboxes
      e.preventDefault();
      document.querySelectorAll(`${yearGroupSelector} input[type="checkbox"]`, `${otherGroupSelector} input[type="checkbox"]`).forEach( cb=> cb.checked = false);
      currentPage = 1; // Reset to page 1
      runFilters();
    });
  }

  // Load More Button

  const loadMoreBtn = document.querySelector(loadMoreBtnSelector);
  if(loadMoreBtn){
    loadMoreBtn.addEventListener('click', onLoadMoreClick);
  }
}

// Mutation Observer to watch for changes in the collection container

function observeMutations(){
 const container = document.querySelector(collectionContainerSelector);
 if(!container) return;
 const observer = new MutationObserver( debounce(()=>{
  runFilters();
 }, 100));
 observer.observe(container, {childList:true, subtree:true});
}

function init(){
  attachListeners();
  observeMutations();
  runFilters();

  window.addEventListener('load', ()=> setTimeout(runFilters, 250));
}

if (document.readyState === 'loading'){
  document.addEventListener('DOMContentLoaded', init);

} else {
  init();
}
})();