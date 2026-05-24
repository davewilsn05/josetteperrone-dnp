const navToggle = document.querySelector("[data-nav-toggle]");
const nav = document.querySelector("[data-nav]");

if (navToggle && nav) {
  navToggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });

  nav.addEventListener("click", (event) => {
    if (event.target instanceof HTMLAnchorElement) {
      nav.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
    }
  });
}

const bookingForm = document.querySelector("[data-booking-form]");
const bookingStatus = document.querySelector("[data-booking-status]");
const parallaxImages = Array.from(document.querySelectorAll("[data-parallax-speed]"));

if (parallaxImages.length && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  let ticking = false;

  const updateParallax = () => {
    const viewportMidpoint = window.innerHeight / 2;

    parallaxImages.forEach((image) => {
      if (!(image instanceof HTMLImageElement)) {
        return;
      }

      const speed = Number(image.dataset.parallaxSpeed || 0.08);
      const bounds = image.getBoundingClientRect();
      const frameMidpoint = bounds.top + bounds.height / 2;
      const rawOffset = (viewportMidpoint - frameMidpoint) * speed;
      const offset = Math.max(-34, Math.min(34, rawOffset));
      image.style.transform = `translate3d(0, ${offset.toFixed(1)}px, 0) scale(1.04)`;
    });

    ticking = false;
  };

  const requestParallaxUpdate = () => {
    if (!ticking) {
      window.requestAnimationFrame(updateParallax);
      ticking = true;
    }
  };

  updateParallax();
  window.addEventListener("scroll", requestParallaxUpdate, { passive: true });
  window.addEventListener("resize", requestParallaxUpdate);
}

if (bookingForm instanceof HTMLFormElement && bookingStatus) {
  bookingForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const submitButton = bookingForm.querySelector("button[type='submit']");
    if (submitButton instanceof HTMLButtonElement) {
      submitButton.disabled = true;
    }

    try {
      const response = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(new FormData(bookingForm))),
      });
      bookingStatus.textContent = response.ok
        ? "Thank you. Your inquiry was received."
        : "Booking requests are being configured. Please try again soon.";
      bookingStatus.hidden = false;
      if (response.ok) {
        bookingForm.reset();
      }
    } catch {
      bookingStatus.textContent = "Booking requests are being configured. Please try again soon.";
      bookingStatus.hidden = false;
    } finally {
      if (submitButton instanceof HTMLButtonElement) {
        submitButton.disabled = false;
      }
    }
  });
}
