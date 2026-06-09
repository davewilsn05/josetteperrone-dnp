(function () {
  const consentKey = "jp_analytics_consent";
  const configUrl = "/api/posthog-config";
  const utmKeys = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"];
  let posthogReady = false;
  let bookingStarted = false;

  const getConsent = () => {
    try {
      const stored = window.localStorage?.getItem(consentKey);
      if (stored) return stored;
    } catch {
      // Fall through to cookie lookup when storage is unavailable.
    }
    const cookie = document.cookie
      .split("; ")
      .find((item) => item.startsWith(`${consentKey}=`));
    return cookie ? cookie.split("=").pop() : "";
  };

  const setConsent = (value) => {
    try {
      window.localStorage?.setItem(consentKey, value);
    } catch {
      document.cookie = `${consentKey}=${value}; max-age=31536000; path=/; SameSite=Lax`;
    }
    const banner = document.querySelector("[data-cookie-banner]");
    if (banner) {
      banner.remove();
    }
  };

  const getPageType = () => {
    if (document.querySelector(".article-page")) return "blog_article";
    if (window.location.pathname.replace(/\/$/, "") === "/blog") return "blog_index";
    return "landing_page";
  };

  const getTrackingContext = () => {
    const params = new URLSearchParams(window.location.search);
    const utm = {};
    utmKeys.forEach((key) => {
      const value = params.get(key);
      if (value) utm[key] = value;
    });

    return {
      page_type: getPageType(),
      path: window.location.pathname,
      url: window.location.href,
      title: document.title,
      referrer: document.referrer || undefined,
      article_category: document.querySelector(".article-meta span")?.textContent?.trim(),
      article_title: document.querySelector(".article-page h1")?.textContent?.trim(),
      ...utm,
    };
  };

  const capture = (eventName, properties = {}) => {
    if (!eventName || !posthogReady || !window.posthog) return;
    window.posthog.capture(eventName, {
      ...getTrackingContext(),
      ...properties,
    });
  };

  const loadPostHog = ({ token, apiHost, projectId }) =>
    new Promise((resolve, reject) => {
      if (!token || !apiHost) {
        reject(new Error("PostHog config is missing"));
        return;
      }

      const existing = document.querySelector("script[data-posthog-library]");
      if (existing) {
        resolve();
        return;
      }

      const script = document.createElement("script");
      script.async = true;
      script.src = `${apiHost.replace(/\/$/, "")}/static/array.js`;
      script.dataset.posthogLibrary = "true";
      script.onload = () => {
        if (!window.posthog) {
          reject(new Error("PostHog library did not initialize"));
          return;
        }

        window.posthog.init(token, {
          api_host: apiHost,
          autocapture: true,
          capture_pageview: false,
          person_profiles: "identified_only",
          persistence: "localStorage+cookie",
          loaded: () => {
            posthogReady = true;
            capture("page_view", { posthog_project_id: projectId });
            resolve();
          },
        });
      };
      script.onerror = () => reject(new Error("PostHog library failed to load"));
      document.head.appendChild(script);
    });

  const initAnalytics = async () => {
    if (getConsent() !== "granted") return;

    try {
      const response = await fetch(configUrl, { cache: "no-store" });
      if (!response.ok) return;
      const config = await response.json();
      if (!config.enabled) return;
      await loadPostHog(config);
    } catch {
      posthogReady = false;
    }
  };

  const showConsentBanner = () => {
    if (getConsent()) return;

    const banner = document.createElement("div");
    banner.className = "cookie-banner";
    banner.dataset.cookieBanner = "true";
    banner.innerHTML = `
      <div>
        <strong>Analytics cookies</strong>
        <p>We use privacy-conscious analytics to understand which pages and topics help event planners. You can accept or decline.</p>
      </div>
      <div class="cookie-actions">
        <button class="button secondary" type="button" data-cookie-decline>Decline</button>
        <button class="button primary" type="button" data-cookie-accept>Accept</button>
      </div>
    `;

    banner.querySelector("[data-cookie-accept]").addEventListener("click", () => {
      setConsent("granted");
      initAnalytics();
    });

    banner.querySelector("[data-cookie-decline]").addEventListener("click", () => {
      setConsent("denied");
    });

    document.body.appendChild(banner);
  };

  document.addEventListener("click", (event) => {
    const target = event.target instanceof Element ? event.target.closest("a, button") : null;
    if (!target) return;

    const text = target.textContent?.trim();
    const href = target instanceof HTMLAnchorElement ? target.getAttribute("href") : undefined;
    const isBookingCta = href === "#booking" || href === "../index.html#booking";
    const isButton = target.classList.contains("button");

    if (isBookingCta || isButton) {
      capture("cta_click", {
        cta_text: text,
        cta_href: href,
        cta_location: target.closest("header, footer, section")?.className || target.tagName.toLowerCase(),
      });
    }
  });

  document.addEventListener("input", (event) => {
    if (bookingStarted) return;
    const form = event.target instanceof Element ? event.target.closest("[data-booking-form]") : null;
    if (!form) return;
    bookingStarted = true;
    capture("booking_form_started");
  });

  document.addEventListener("josette:analytics-capture", (event) => {
    capture(event.detail?.eventName, event.detail?.properties);
  });

  document.addEventListener("josette:analytics-identify-booking-lead", (event) => {
    if (!posthogReady || !window.posthog) return;
    const { email, name, organization } = event.detail || {};
    if (!email) return;

    window.posthog.identify(String(email).toLowerCase(), {
      email: String(email).toLowerCase(),
      name: name || undefined,
      organization: organization || undefined,
    });
  });

  showConsentBanner();
  initAnalytics();
})();
