// Lotek — Website Lite: mobile menu, gentle reveals, project filter + photo viewer, enquiry form.
(function () {
  document.documentElement.classList.add("js");

  // Mobile menu
  var burger = document.querySelector(".burger");
  var nav = document.getElementById("nav");
  if (burger && nav) {
    burger.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      burger.setAttribute("aria-expanded", String(open));
      burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });
  }

  // Reveal sections as they scroll into view
  var items = document.querySelectorAll(".scard, .pcard, .box, .feat, .split > *, .sec-head");
  if ("IntersectionObserver" in window && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    items.forEach(function (el) {
      if (el.getBoundingClientRect().top > innerHeight) { el.classList.add("rv"); io.observe(el); }
    });
  }

  // Project filter
  var buttons = document.querySelectorAll(".filters button");
  buttons.forEach(function (b) {
    b.addEventListener("click", function () {
      var f = b.getAttribute("data-f");
      buttons.forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); });
      document.querySelectorAll("#plist .pcard").forEach(function (c) {
        c.hidden = !(f === "all" || c.getAttribute("data-svc").split(" ").indexOf(f) > -1);
      });
    });
  });

  // Photo viewer
  var lb = document.getElementById("lb");
  if (lb) {
    var lbImg = document.getElementById("lb-img"), lbT = document.getElementById("lb-t"), lbN = document.getElementById("lb-n");
    var set = null, idx = 0, opener = null;
    var show = function () {
      lbImg.src = set.photos[idx];
      lbImg.alt = set.name + " — photo " + (idx + 1) + " (placeholder image)";
      lbT.textContent = set.name;
      lbN.textContent = (idx + 1) + " / " + set.photos.length;
      var multi = set.photos.length > 1;
      document.getElementById("lb-p").hidden = !multi;
      document.getElementById("lb-nx").hidden = !multi;
    };
    var step = function (d) { idx = (idx + d + set.photos.length) % set.photos.length; show(); };
    document.querySelectorAll("[data-gallery]").forEach(function (b) {
      b.addEventListener("click", function () {
        set = JSON.parse(b.getAttribute("data-gallery")); idx = 0; opener = b; show();
        if (lb.showModal) lb.showModal(); else lb.setAttribute("open", "");
      });
    });
    document.getElementById("lb-p").addEventListener("click", function () { step(-1); });
    document.getElementById("lb-nx").addEventListener("click", function () { step(1); });
    document.getElementById("lb-x").addEventListener("click", function () { lb.close(); });
    lb.addEventListener("keydown", function (ev) {
      if (ev.key === "ArrowRight") step(1);
      if (ev.key === "ArrowLeft") step(-1);
    });
    lb.addEventListener("close", function () { if (opener) opener.focus(); });
    lb.addEventListener("click", function (ev) { if (ev.target === lb) lb.close(); });
  }

  // Enquiry form: opens the visitor's email app or WhatsApp with the message written.
  var form = document.getElementById("enq");
  if (form) {
    var q = new URLSearchParams(location.search).get("service");
    if (q) { var sel = document.getElementById("f-svc"); if (sel.querySelector('option[value="' + q + '"]')) sel.value = q; }
    var val = function (id) { return document.getElementById(id).value.trim(); };
    var compose = function () {
      var svc = document.getElementById("f-svc");
      var lines = ["Project enquiry from " + val("f-name") + (val("f-co") ? " (" + val("f-co") + ")" : "")];
      if (svc.value) lines.push("Service: " + svc.options[svc.selectedIndex].text);
      lines.push("Email: " + val("f-email"));
      if (val("f-phone")) lines.push("Phone: " + val("f-phone"));
      lines.push("", val("f-msg"));
      return lines.join("\n");
    };
    var check = function () {
      var err = document.getElementById("f-err"), msg = "";
      if (!val("f-name")) msg = "Please enter your name.";
      else if (!/^\S+@\S+\.\S+$/.test(val("f-email"))) msg = "Please enter a valid email address.";
      else if (val("f-msg").length < 10) msg = "Please tell us a little about your project.";
      err.textContent = msg; err.hidden = !msg;
      return !msg;
    };
    var done = function (how) {
      var ok = document.getElementById("f-ok");
      ok.textContent = how === "email"
        ? "Your email app should now be open with your enquiry. Press send there to reach our team."
        : "WhatsApp should now be open with your message. Press send there to reach our team.";
      ok.hidden = false;
    };
    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      if (!check()) return;
      location.href = "mailto:info@lotek.lk?subject=" + encodeURIComponent("Project enquiry — " + val("f-name")) + "&body=" + encodeURIComponent(compose());
      done("email");
    });
    document.getElementById("f-wa").addEventListener("click", function () {
      if (!check()) return;
      window.open("https://wa.me/94777586160?text=" + encodeURIComponent(compose()), "_blank", "noopener");
      done("whatsapp");
    });
  }
})();
