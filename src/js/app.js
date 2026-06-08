/**
 * app.js - Component Loader & Script Orchestrator
 * Loads HTML components (Header, Footer, Cart Overlay)
 * then conditionally loads core + module + page scripts.
 */

$(async function () {
  // HTML components to inject
  var components = [
    { id: "#component-header", url: "src/components/header.html" },
    { id: "#component-footer", url: "src/components/footer.html" },
    { id: "#component-cart-overlay", url: "src/components/cart-overlay.html" },
  ];

  // Hide loader gracefully
  var hideLoader = function () {
    var $loader = $("#loader");
    if (!$loader.length) return;

    $loader.addClass("opacity-0").css("pointer-events", "none");

    setTimeout(function () {
      $loader.hide();
      $("body").removeClass("opacity-0");
    }, 600);
  };

  // Load a single JS file with version to bust cache
  var loadScript = function (src) {
    var version = "35"; // Central version for all modules & pages
    return $.ajax({ url: src + "?v=" + version, dataType: "script", cache: true });
  };

  // Load multiple scripts in sequence
  var loadScripts = function (scripts) {
    var promise = $.Deferred().resolve().promise();
    $.each(scripts, function (i, src) {
      promise = promise.then(function () {
        return loadScript(src);
      });
    });
    return promise;
  };

  // Detect current page from URL
  var getCurrentPage = function () {
    var path = window.location.pathname;
    var filename = path.substring(path.lastIndexOf("/") + 1) || "index.html";
    return filename;
  };

  // Script mapping: core scripts load on every page,
  // modules and page scripts load conditionally
  var coreScripts = [
    "src/js/core/header.js",
    "src/js/core/scroll-reveal.js",
    "src/js/core/page-transition.js",
    "src/js/modules/toast.js",
  ];

  var pageConfig = {
    "index.html": {
      modules: ["parallax", "luxury-scroll", "glow", "cart", "wishlist", "newsletter", "toast"],
      page: "home",
    },
    "collections.html": {
      modules: ["cart", "wishlist", "toast"],
      page: "collections",
    },
    "product-detail.html": {
      modules: ["cart", "wishlist", "toast", "tabs", "accordion"],
      page: "product-detail",
    },
    "checkout.html": {
      modules: ["cart", "wishlist", "toast"],
      page: "checkout",
    },
    "wishlist.html": {
      modules: ["cart", "wishlist", "toast"],
      page: "wishlist-page",
    },
    "about.html": {
      modules: ["parallax", "luxury-scroll", "cart", "wishlist", "toast"],
      page: "about",
    },
    "services.html": {
      modules: ["parallax", "accordion", "cart", "wishlist", "toast"],
      page: null,
    },
    "contact.html": {
      modules: ["accordion", "toast", "cart", "wishlist"],
      page: "contact",
    },
    "account.html": {
      modules: ["tabs", "cart", "wishlist", "toast"],
      page: null,
    },
  };

  try {
    // 1. Load HTML components
    await Promise.allSettled(
      components.map(async function (comp) {
        var $mountNode = $(comp.id);
        if (!$mountNode.length) return;

        try {
          var resp = await fetch(comp.url + "?t=" + Date.now());
          var buf = await resp.arrayBuffer();
          var html = new TextDecoder("utf-8").decode(buf);
          $mountNode[0].innerHTML = html;
        } catch (err) {
          console.error("Failed to load: " + comp.url, err);
        }
      })
    );

    // 2. Load core scripts (run on every page)
    await loadScripts(coreScripts);

    // 3. Determine current page and load modules + page script
    var currentPage = getCurrentPage();
    var config = pageConfig[currentPage] || { modules: [], page: null };

    // Build module script paths
    var moduleScripts = $.map(config.modules || [], function (mod) {
      return "src/js/modules/" + mod + ".js";
    });

    // Load modules
    if (moduleScripts.length) {
      await loadScripts(moduleScripts);
    }

    // Load page-specific script
    if (config.page) {
      await loadScript("src/js/pages/" + config.page + ".js");
    }

    // Check for pending toast in sessionStorage
    try {
      var pendingToast = sessionStorage.getItem("pendingToast");
      if (pendingToast) {
        var toastData = JSON.parse(pendingToast);
        setTimeout(function () {
          $(document).trigger("toast", [toastData.message, toastData.type]);
        }, 800);
        sessionStorage.removeItem("pendingToast");
      }
    } catch (e) {
      console.error("Pending toast error:", e);
    }
  } catch (err) {
    console.error("App loader error:", err);
  } finally {
    hideLoader();
  }

});
