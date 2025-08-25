
document.getElementById("viewHome").addEventListener("click", function () {
  window.location.href = "index.html";
});
document.getElementById("userProfile").addEventListener("click", function () {
  window.location.href = "login.html";
});
document.getElementById("viewMen").addEventListener("click", function () {
  window.location.href = "men-product.html";
});
document.getElementById("viewWomen").addEventListener("click", function () {
  window.location.href = "women-product.html";
});
document.getElementById("viewCart").addEventListener("click", function () {
  window.location.href = "cart.html";
});
document.getElementById("viewWishlist").addEventListener("click", function () {
  window.location.href = "wishlist.html";
});
document.getElementById("saleBtn").addEventListener("click", function () {
  window.location.href = "discount.html";
});
document.getElementById("discountSale").addEventListener("click", function () {
  window.location.href = "discount.html";
});



const slider = document.querySelector("#slider");
const slides = slider.querySelectorAll(".slide");
const leftBtn = slider.querySelector(".arrow.left");
const rightBtn = slider.querySelector(".arrow.right");


let active = 2;

function updateSlides() {
  slides.forEach((slide, index) => {
    slide.className = "slide";
    if (index === active) {
      slide.classList.add("active");
    } else if (index === active - 1) {
      slide.classList.add("left");
    } else if (index === active + 1) {
      slide.classList.add("right");
    }else if (index === active - 2) {
      slide.classList.add("left1");
    } else if (index === active + 2) {
      slide.classList.add("right1");
    }
  });
}

leftBtn.addEventListener("click", () => {
  active = (active - 1 + slides.length) % slides.length;
  updateSlides();
});

rightBtn.addEventListener("click", () => {
  active = (active + 1) % slides.length;
  updateSlides();
});


updateSlides();

window.addEventListener("scroll", () => {
  let heroImg = document.querySelector(".hero-img");
  let heroWrap = document.querySelector(".hero-wrap");

  if (heroImg && heroWrap) {
    let rect = heroWrap.getBoundingClientRect();
    let scrollTop = window.scrollY || window.pageYOffset;


    let offset = (scrollTop - heroWrap.offsetTop) * 0.2;

    heroImg.style.transform = `translate3d(0, ${offset}px, 0)`;
  }
});

