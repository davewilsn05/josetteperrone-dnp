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
let publicConfigPromise;
let recaptchaScriptPromise;

const utmKeys = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"];

const getTrackingContext = () => {
  const params = new URLSearchParams(window.location.search);
  const utm = {};
  utmKeys.forEach((key) => {
    const value = params.get(key);
    if (value) utm[key] = value;
  });

  return {
    path: window.location.pathname,
    url: window.location.href,
    title: document.title,
    referrer: document.referrer || undefined,
    ...utm,
  };
};

const track = (eventName, properties = {}) => {
  document.dispatchEvent(
    new CustomEvent("josette:analytics-capture", {
      detail: { eventName, properties },
    }),
  );
};

const identifyBookingLead = (formData) => {
  document.dispatchEvent(
    new CustomEvent("josette:analytics-identify-booking-lead", {
      detail: {
        email: formData.get("email"),
        name: formData.get("name"),
        organization: formData.get("organization"),
      },
    }),
  );
};

const getPublicConfig = async () => {
  if (!publicConfigPromise) {
    publicConfigPromise = fetch("/api/public-config", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : {}))
      .catch(() => ({}));
  }

  return publicConfigPromise;
};

const loadRecaptchaScript = async () => {
  const { recaptchaSiteKey } = await getPublicConfig();
  if (!recaptchaSiteKey || window.grecaptcha) {
    return recaptchaSiteKey || "";
  }

  if (!recaptchaScriptPromise) {
    recaptchaScriptPromise = new Promise((resolve) => {
      const script = document.createElement("script");
      script.async = true;
      script.defer = true;
      script.dataset.recaptcha = "true";
      script.src = `https://www.google.com/recaptcha/api.js?render=${encodeURIComponent(recaptchaSiteKey)}`;
      script.onload = () => resolve();
      script.onerror = () => resolve();
      document.head.appendChild(script);
    });
  }

  await recaptchaScriptPromise;
  return recaptchaSiteKey;
};

const getRecaptchaToken = async () => {
  const recaptchaSiteKey = await loadRecaptchaScript();
  if (!recaptchaSiteKey || !window.grecaptcha) {
    return "";
  }

  return new Promise((resolve) => {
    window.grecaptcha.ready(() => {
      window.grecaptcha
        .execute(recaptchaSiteKey, { action: "booking_inquiry" })
        .then(resolve)
        .catch(() => resolve(""));
    });
  });
};

loadRecaptchaScript();

const bookingErrorMessage = async (response) => {
  let error = "";
  try {
    const data = await response.json();
    error = typeof data.error === "string" ? data.error : "";
  } catch {
    error = "";
  }

  if (response.status === 400) return error || "Please check the form details and try again.";
  if (response.status === 403) return "We couldn't verify this request. Please refresh the page and try again.";
  if (response.status === 502 || response.status === 503) {
    return "Booking delivery is temporarily unavailable. Please try again soon.";
  }
  return "We couldn't submit the inquiry. Please try again.";
};

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
    const formData = new FormData(bookingForm);
    const payload = Object.fromEntries(formData);

    track("booking_form_submitted", {
      event_type: payload.event_type,
      format: payload.format,
      audience_size: payload.audience_size,
      desired_topic: payload.desired_topic,
      budget_range: payload.budget_range,
      location: payload.location,
    });

    if (submitButton instanceof HTMLButtonElement) {
      submitButton.disabled = true;
    }

    try {
      const recaptchaToken = await getRecaptchaToken();
      const response = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...payload,
          recaptchaToken,
          tracking: getTrackingContext(),
        }),
      });
      bookingStatus.textContent = response.ok ? "Thank you. Your inquiry was received." : await bookingErrorMessage(response);
      bookingStatus.hidden = false;
      if (response.ok) {
        identifyBookingLead(formData);
        track("booking_form_success", {
          event_type: payload.event_type,
          format: payload.format,
          audience_size: payload.audience_size,
          desired_topic: payload.desired_topic,
        });
        bookingForm.reset();
      } else {
        track("booking_form_failure", {
          status: response.status,
        });
      }
    } catch {
      track("booking_form_failure", {
        status: "network_error",
      });
      bookingStatus.textContent = "Network error. Please check your connection and try again.";
      bookingStatus.hidden = false;
    } finally {
      if (submitButton instanceof HTMLButtonElement) {
        submitButton.disabled = false;
      }
    }
  });
}
