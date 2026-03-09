/**
 * Amazon-style Image Zoom
 */

window.initializeAmazonZoom = function() {
  // Only initialize for the active slide
  const activeSlide = document.querySelector('.main-slider .splide__slide.is-active');
  if (!activeSlide) return;
  
  const container = activeSlide.querySelector('.zoom-container');
  if (!container) return;
  
  const img = container.querySelector('.zoom-image');
  const lens = container.querySelector('.zoom-lens');
  const result = container.querySelector('.zoom-result');
  
  if (!img || !lens || !result) return;
  
  const resultImg = result.querySelector('img');
  if (!resultImg) return;
  
  // Remove any existing event listeners
  const newContainer = container.cloneNode(true);
  container.parentNode.replaceChild(newContainer, container);
  
  // Get fresh references
  const freshImg = newContainer.querySelector('.zoom-image');
  const freshLens = newContainer.querySelector('.zoom-lens');
  const freshResult = newContainer.querySelector('.zoom-result');
  const freshResultImg = freshResult.querySelector('img');
  
  // Setup zoom dimensions
  const setupZoom = () => {
    const zoom = 2.5;
    freshResultImg.style.width = (freshImg.naturalWidth * zoom) + 'px';
    freshResultImg.style.height = (freshImg.naturalHeight * zoom) + 'px';
  };
  
  if (freshImg.complete) {
    setupZoom();
  } else {
    freshImg.onload = setupZoom;
  }
  
  // Mouse enter
  freshImg.addEventListener('mouseenter', function() {
    freshLens.style.display = 'block';
    freshResult.style.display = 'block';
  });
  
  // Mouse leave
  freshImg.addEventListener('mouseleave', function() {
    freshLens.style.display = 'none';
    freshResult.style.display = 'none';
  });
  
  // Mouse move
  freshImg.addEventListener('mousemove', function(e) {
    const rect = freshImg.getBoundingClientRect();
    let x = e.clientX - rect.left;
    let y = e.clientY - rect.top;
    
    // Position lens
    let lensX = x - (freshLens.offsetWidth / 2);
    let lensY = y - (freshLens.offsetHeight / 2);
    
    // Keep within bounds
    if (lensX < 0) lensX = 0;
    if (lensY < 0) lensY = 0;
    if (lensX > rect.width - freshLens.offsetWidth) lensX = rect.width - freshLens.offsetWidth;
    if (lensY > rect.height - freshLens.offsetHeight) lensY = rect.height - freshLens.offsetHeight;
    
    freshLens.style.left = lensX + 'px';
    freshLens.style.top = lensY + 'px';
    
    // Position zoomed image
    const cx = freshResult.offsetWidth / freshLens.offsetWidth;
    const cy = freshResult.offsetHeight / freshLens.offsetHeight;
    
    freshResultImg.style.left = '-' + (lensX * cx) + 'px';
    freshResultImg.style.top = '-' + (lensY * cy) + 'px';
  });
};
