// The theme button, shared by the home page and the CV: switches between light and dark, and
// remembers the choice on this device. The saved choice is applied in each page's <head>, before
// anything is drawn; this file is loaded at the end of the page.
(function () {
  var root = document.documentElement;
  var toggle = document.querySelector(".theme-toggle");
  if (!toggle) return;
  var label = toggle.querySelector(".theme-label");
  var systemDark = window.matchMedia("(prefers-color-scheme: dark)");
  function isDark() { return root.dataset.theme ? root.dataset.theme === "dark" : systemDark.matches; }
  function showTheme() {
    var dark = isDark();
    label.textContent = dark ? "Use the light theme" : "Use the dark theme";
    toggle.title = label.textContent;
    document.querySelectorAll('meta[name="theme-color"]').forEach(function (m) { m.content = dark ? "#1a1916" : "#f8f6f0"; });
  }
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  function setTheme(next) {
    root.dataset.theme = next;
    try { localStorage.setItem("theme", next); } catch (e) {}
    showTheme();
  }
  // Switching reveals the new theme in a circle that grows from the button to the farthest
  // corner of the window. Without view transitions, or with reduced motion, it switches at once.
  toggle.addEventListener("click", function () {
    var next = isDark() ? "light" : "dark";
    if (!document.startViewTransition || reduceMotion.matches) return setTheme(next);
    var r = toggle.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2;
    var end = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    var at = " at " + x + "px " + y + "px)";
    document.startViewTransition(function () { setTheme(next); }).ready.then(function () {
      root.animate({ clipPath: ["circle(0px" + at, "circle(" + end + "px" + at] },
        { duration: 650, easing: "cubic-bezier(.4, 0, .2, 1)", pseudoElement: "::view-transition-new(root)" });
    }).catch(function () {});
  });
  if (systemDark.addEventListener) systemDark.addEventListener("change", showTheme);
  toggle.hidden = false;
  showTheme();
})();
