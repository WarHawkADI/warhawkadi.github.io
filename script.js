/* =====================================================================
   Aditya Rai — portfolio interactions
   No dependencies. Every module is an isolated IIFE that no-ops when its
   elements are absent, so a markup change can never cascade into a
   page-wide script error.
   ===================================================================== */

(function () {
  "use strict";

  var root = document.documentElement;
  var motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  var reduceMotion = motionQuery.matches;
  var canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var richFx = canHover && !reduceMotion;

  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };

  /* ---------- Theme ------------------------------------------------ */
  // The initial value is set by the inline script in <head> to avoid a flash.
  (function theme() {
    var btn = $("#theme-toggle");
    if (!btn) return;

    var apply = function (next) {
      root.dataset.theme = next;
      try { localStorage.setItem("theme", next); } catch (e) { /* private mode */ }
    };

    btn.addEventListener("click", function () {
      apply(root.dataset.theme === "dark" ? "light" : "dark");
    });

    // Press T to toggle — ignored while typing.
    document.addEventListener("keydown", function (e) {
      if (e.key !== "t" && e.key !== "T") return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      var t = e.target;
      if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
      apply(root.dataset.theme === "dark" ? "light" : "dark");
    });

    // Follow the OS only while the visitor hasn't chosen a theme themselves.
    var mq = window.matchMedia("(prefers-color-scheme: light)");
    var onChange = function (e) {
      var chosen = null;
      try { chosen = localStorage.getItem("theme"); } catch (err) { /* ignore */ }
      if (!chosen) root.dataset.theme = e.matches ? "light" : "dark";
    };
    if (mq.addEventListener) mq.addEventListener("change", onChange);
    else if (mq.addListener) mq.addListener(onChange);
  })();

  /* ---------- Mobile navigation ------------------------------------ */
  (function mobileNav() {
    var nav = $("#nav");
    var burger = $("#nav-burger");
    var links = $("#nav-links");
    if (!nav || !burger || !links) return;

    var body = document.body;
    var savedY = 0;

    // position:fixed rather than overflow:hidden — iOS Safari ignores the latter.
    var lock = function () {
      savedY = window.scrollY || window.pageYOffset;
      body.style.top = -savedY + "px";
      body.classList.add("is-locked");
    };

    var unlock = function (restore) {
      body.classList.remove("is-locked");
      body.style.top = "";
      if (restore) window.scrollTo(0, savedY);
    };

    // `restore` is false when an in-page link closes the drawer: putting the
    // old scroll position back would fight the anchor jump that follows.
    var setOpen = function (open, restore) {
      if (nav.classList.contains("is-open") === open) return;
      nav.classList.toggle("is-open", open);
      burger.setAttribute("aria-expanded", String(open));
      burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");

      if (open) {
        lock();
        var first = $("a", links);
        if (first) first.focus({ preventScroll: true });
      } else {
        unlock(restore !== false);
      }
    };

    burger.addEventListener("click", function () {
      setOpen(!nav.classList.contains("is-open"));
    });

    links.addEventListener("click", function (e) {
      var link = e.target.closest("a");
      if (!link) return;

      var href = link.getAttribute("href") || "";
      var target = href.charAt(0) === "#" && href.length > 1 ? document.querySelector(href) : null;

      if (!target) {
        setOpen(false);
        return;
      }

      // Unlock first, then drive the scroll ourselves once layout has settled.
      e.preventDefault();
      setOpen(false, false);
      window.requestAnimationFrame(function () {
        target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
        if (window.history && window.history.pushState) {
          window.history.pushState(null, "", href);
        }
      });
    });

    document.addEventListener("keydown", function (e) {
      if (e.key !== "Escape" || !nav.classList.contains("is-open")) return;
      setOpen(false);
      burger.focus();
    });

    // Keep Tab inside the drawer while it covers the page.
    links.addEventListener("keydown", function (e) {
      if (e.key !== "Tab" || !nav.classList.contains("is-open")) return;
      var focusable = $$("a, button", links).filter(function (el) { return el.offsetParent !== null; });
      if (!focusable.length) return;
      var first = focusable[0];
      var last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    });

    // Growing past the mobile breakpoint must not leave the page locked.
    var desktop = window.matchMedia("(min-width: 901px)");
    var onBreak = function (e) { if (e.matches) setOpen(false); };
    if (desktop.addEventListener) desktop.addEventListener("change", onBreak);
    else if (desktop.addListener) desktop.addListener(onBreak);
  })();

  /* ---------- Sticky nav, scroll progress, back-to-top ------------- */
  (function scrollChrome() {
    var nav = $("#nav");
    var bar = $("#progress-bar");
    var toTop = $("#to-top");
    var ticking = false;

    var update = function () {
      var y = window.scrollY || window.pageYOffset;
      var max = document.documentElement.scrollHeight - window.innerHeight;

      if (nav) nav.classList.toggle("is-stuck", y > 8);
      if (bar) bar.style.width = (max > 0 ? (y / max) * 100 : 0) + "%";
      if (toTop) toTop.classList.toggle("is-on", y > window.innerHeight * 0.7);

      ticking = false;
    };

    window.addEventListener("scroll", function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(update);
    }, { passive: true });

    window.addEventListener("resize", update, { passive: true });
    update();

    if (toTop) {
      toTop.addEventListener("click", function () {
        window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
      });
    }
  })();

  /* ---------- Scroll-spy ------------------------------------------- */
  (function scrollSpy() {
    var links = $$("#nav-links > a");
    if (!links.length || !("IntersectionObserver" in window)) return;

    var byId = {};
    var sections = [];

    links.forEach(function (link) {
      var id = link.getAttribute("href");
      if (!id || id.charAt(0) !== "#") return;
      var section = document.querySelector(id);
      if (!section) return;
      byId[id.slice(1)] = link;
      sections.push(section);
    });

    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var active = byId[entry.target.id];
        if (!active) return;
        links.forEach(function (l) { l.classList.remove("is-active"); });
        active.classList.add("is-active");
      });
    }, { rootMargin: "-45% 0px -50% 0px", threshold: 0 });

    sections.forEach(function (s) { spy.observe(s); });
  })();

  /* ---------- Reveal on scroll ------------------------------------- */
  (function reveal() {
    var items = $$("[data-reveal]");
    if (!items.length) return;

    if (!("IntersectionObserver" in window) || reduceMotion) {
      items.forEach(function (el) { el.classList.add("is-in"); });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-in");
        io.unobserve(entry.target);
      });
    }, { threshold: 0.1, rootMargin: "0px 0px -40px 0px" });

    items.forEach(function (el) { io.observe(el); });
  })();

  /* ---------- Hero title: per-letter entrance ---------------------- */
  (function splitTitle() {
    var el = $("#hero-title");
    if (!el || reduceMotion) return;

    var text = el.textContent.trim();
    if (!text) return;

    // The split spans are decorative; the heading keeps its readable name.
    el.setAttribute("aria-label", text);
    el.textContent = "";

    var frag = document.createDocumentFragment();
    text.split("").forEach(function (ch, i) {
      var span = document.createElement("span");
      span.className = ch === " " ? "ltr ltr--space" : "ltr";
      span.textContent = ch === " " ? " " : ch;
      span.style.setProperty("--i", i);
      span.setAttribute("aria-hidden", "true");
      frag.appendChild(span);
    });
    el.appendChild(frag);

    // The letters carry the animation now, so drop the container-level reveal.
    el.removeAttribute("data-reveal");
    el.classList.add("is-in");
  })();

  /* ---------- Hero typewriter -------------------------------------- */
  (function typewriter() {
    var el = $("#typed");
    if (!el) return;

    var phrases = [
      "data platforms that hold up.",
      "backends that scale sideways.",
      "AI systems you can audit.",
      "pipelines that don't page you at 3am."
    ];

    if (reduceMotion) {
      el.textContent = phrases[0];
      return;
    }

    var TYPE = 52, ERASE = 26, HOLD = 1900, GAP = 340;
    var i = 0, pos = 0, erasing = false, timer = null;

    var tick = function () {
      var phrase = phrases[i];
      pos += erasing ? -1 : 1;
      el.textContent = phrase.slice(0, pos);

      var delay = erasing ? ERASE : TYPE;

      if (!erasing && pos === phrase.length) {
        erasing = true;
        delay = HOLD;
      } else if (erasing && pos === 0) {
        erasing = false;
        i = (i + 1) % phrases.length;
        delay = GAP;
      }

      timer = window.setTimeout(tick, delay);
    };

    tick();

    // Don't burn timers while the tab is in the background.
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) {
        window.clearTimeout(timer);
      } else {
        window.clearTimeout(timer);
        tick();
      }
    });
  })();

  /* ---------- Animated stat counters ------------------------------- */
  (function counters() {
    var nums = $$("[data-count]");
    if (!nums.length || reduceMotion || !("IntersectionObserver" in window)) return;

    var run = function (el) {
      var target = parseFloat(el.dataset.count);
      if (isNaN(target)) return;
      var suffix = el.dataset.suffix || "";
      var duration = 1500;
      var start = null;

      var step = function (ts) {
        if (start === null) start = ts;
        var p = Math.min((ts - start) / duration, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * eased) + suffix;
        if (p < 1) window.requestAnimationFrame(step);
      };

      el.textContent = "0" + suffix;
      window.requestAnimationFrame(step);
    };

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        run(entry.target);
        io.unobserve(entry.target);
      });
    }, { threshold: 0.6 });

    nums.forEach(function (el) { io.observe(el); });
  })();

  /* ---------- Tilt + cursor spotlight ------------------------------ */
  (function tiltSpotlight() {
    if (!richFx) return;

    var targets = $$("[data-tilt], [data-spotlight]");
    if (!targets.length) return;

    targets.forEach(function (el) {
      var tilts = el.hasAttribute("data-tilt");
      var spots = el.hasAttribute("data-spotlight");
      // data-tilt="n" caps the angle; a full-width card needs a gentler one.
      var max = parseFloat(el.getAttribute("data-tilt")) || (el.classList.contains("avatar") ? 9 : 5);
      var frame = null;

      var onMove = function (e) {
        if (e.pointerType && e.pointerType !== "mouse") return;
        if (frame) return;

        frame = window.requestAnimationFrame(function () {
          frame = null;
          var r = el.getBoundingClientRect();
          if (!r.width || !r.height) return;

          var px = (e.clientX - r.left) / r.width;
          var py = (e.clientY - r.top) / r.height;

          if (spots) {
            el.style.setProperty("--mx", (px * 100).toFixed(1) + "%");
            el.style.setProperty("--my", (py * 100).toFixed(1) + "%");
          }
          if (tilts) {
            el.classList.add("is-tilting");
            el.style.setProperty("--ry", ((px - 0.5) * 2 * max).toFixed(2) + "deg");
            el.style.setProperty("--rx", ((0.5 - py) * 2 * max).toFixed(2) + "deg");
          }
        });
      };

      var onLeave = function () {
        if (frame) {
          window.cancelAnimationFrame(frame);
          frame = null;
        }
        el.classList.remove("is-tilting");
        el.style.setProperty("--rx", "0deg");
        el.style.setProperty("--ry", "0deg");
      };

      el.addEventListener("pointermove", onMove, { passive: true });
      el.addEventListener("pointerleave", onLeave, { passive: true });
    });
  })();

  /* ---------- Magnetic buttons ------------------------------------- */
  (function magnetic() {
    if (!richFx) return;

    $$("[data-magnetic]").forEach(function (el) {
      el.addEventListener("pointermove", function (e) {
        if (e.pointerType && e.pointerType !== "mouse") return;
        var r = el.getBoundingClientRect();
        var dx = e.clientX - (r.left + r.width / 2);
        var dy = e.clientY - (r.top + r.height / 2);
        el.classList.add("is-pulling");
        el.style.setProperty("--mgx", (dx * 0.2).toFixed(1) + "px");
        el.style.setProperty("--mgy", (dy * 0.3).toFixed(1) + "px");
      }, { passive: true });

      el.addEventListener("pointerleave", function () {
        el.classList.remove("is-pulling");
        el.style.setProperty("--mgx", "0px");
        el.style.setProperty("--mgy", "0px");
      }, { passive: true });
    });
  })();

  /* ---------- Project filters -------------------------------------- */
  (function filters() {
    var buttons = $$(".filter");
    var cards = $$("[data-cat]");
    var empty = $("#filter-empty");
    if (!buttons.length || !cards.length) return;

    var applyFilter = function (btn) {
      var want = btn.dataset.filter;

      buttons.forEach(function (b) {
        var on = b === btn;
        b.classList.toggle("is-active", on);
        b.setAttribute("aria-pressed", String(on));
      });

      var shown = 0;
      cards.forEach(function (card) {
        var cats = (card.dataset.cat || "").split(/\s+/);
        var match = want === "all" || cats.indexOf(want) > -1;
        card.classList.toggle("is-hidden", !match);
        if (!match) return;

        if (!reduceMotion) {
          // Replay the reveal so the surviving cards cascade back in.
          card.style.setProperty("--d", shown * 45 + "ms");
          card.classList.remove("is-in");
          void card.offsetWidth;
          card.classList.add("is-in");
        } else {
          card.classList.add("is-in");
        }
        shown++;
      });

      if (empty) empty.hidden = shown > 0;
    };

    buttons.forEach(function (btn) {
      btn.addEventListener("click", function () { applyFilter(btn); });
    });

    // Left/right arrows move focus along the row. They deliberately do not
    // activate — these are toggle buttons, so the visitor presses to choose.
    var list = buttons[0].parentNode;
    list.addEventListener("keydown", function (e) {
      var dir = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
      if (!dir) return;
      var idx = buttons.indexOf(document.activeElement);
      if (idx < 0) return;
      e.preventDefault();
      buttons[(idx + dir + buttons.length) % buttons.length].focus();
    });
  })();

  /* ---------- Trailing cursor -------------------------------------- */
  (function cursor() {
    var ring = $("#cursor");
    if (!ring || !richFx) return;

    var tx = 0, ty = 0, x = 0, y = 0, started = false;

    document.addEventListener("mousemove", function (e) {
      tx = e.clientX;
      ty = e.clientY;
      if (!started) {
        started = true;
        x = tx;
        y = ty;
        ring.classList.add("is-on");
      }
    }, { passive: true });

    // Position via the standalone `translate` property so the CSS
    // `transform: scale()` on .is-hot still applies independently.
    var loop = function () {
      x += (tx - x) * 0.18;
      y += (ty - y) * 0.18;
      ring.style.translate = x + "px " + y + "px";
      window.requestAnimationFrame(loop);
    };
    window.requestAnimationFrame(loop);

    document.addEventListener("mouseover", function (e) {
      var hot = e.target.closest("a, button, input, textarea, .pcard, .feature, .honor, .pillar, .tags--lg li");
      ring.classList.toggle("is-hot", !!hot);
    }, { passive: true });

    document.addEventListener("mouseleave", function () { ring.classList.remove("is-on"); });
    document.addEventListener("mouseenter", function () { if (started) ring.classList.add("is-on"); });
  })();

  /* ---------- Copy email ------------------------------------------- */
  (function copyEmail() {
    var btn = $("#copy-email");
    var label = $("#copy-label");
    if (!btn || !label) return;

    var EMAIL = "aditya23047@iiitd.ac.in";
    var original = label.textContent;
    var timer;

    var fallbackCopy = function (text) {
      var ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      var ok = false;
      try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
      document.body.removeChild(ta);
      return ok;
    };

    var flash = function (ok) {
      label.textContent = ok ? "Copied to clipboard" : EMAIL;
      btn.classList.toggle("is-done", ok);
      window.clearTimeout(timer);
      timer = window.setTimeout(function () {
        label.textContent = original;
        btn.classList.remove("is-done");
      }, 2200);
    };

    btn.addEventListener("click", function () {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(EMAIL)
          .then(function () { flash(true); })
          .catch(function () { flash(fallbackCopy(EMAIL)); });
      } else {
        flash(fallbackCopy(EMAIL));
      }
    });
  })();

  /* ---------- Contact form ----------------------------------------- */
  (function contactForm() {
    var form = $("#contact-form");
    var status = $("#form-status");
    var btn = $("#submit-btn");
    if (!form || !status || !btn) return;

    var btnText = $("span", btn);
    var idle = btnText ? btnText.textContent : "";

    var say = function (msg, kind) {
      status.textContent = msg;
      status.classList.remove("is-ok", "is-err");
      if (kind) status.classList.add(kind);
    };

    form.addEventListener("submit", function (e) {
      // fetch() keeps the visitor on the page; without it the form still
      // posts to Formspree the normal way.
      if (!window.fetch) return;
      e.preventDefault();
      if (!form.reportValidity()) return;

      btn.setAttribute("aria-busy", "true");
      if (btnText) btnText.textContent = "Sending…";
      say("");

      fetch(form.action, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" }
      })
        .then(function (res) {
          if (res.ok) {
            form.reset();
            say("Thanks — your message is on its way. I'll reply soon.", "is-ok");
            return;
          }
          return res.json().then(function (data) {
            var detail = data && data.errors && data.errors.length
              ? data.errors.map(function (err) { return err.message; }).join(", ")
              : "Something went wrong. Please try again.";
            say(detail, "is-err");
          });
        })
        .catch(function () {
          say("Couldn't reach the server. Email me at aditya23047@iiitd.ac.in instead.", "is-err");
        })
        .then(function () {
          btn.removeAttribute("aria-busy");
          if (btnText) btnText.textContent = idle;
        });
    });
  })();

  /* ---------- Footer year ------------------------------------------ */
  (function year() {
    var el = $("#year");
    if (el) el.textContent = String(new Date().getFullYear());
  })();

})();
