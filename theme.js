(function () {
    var KEY = "basslab-palette";
    var names = {
        "canadian-rapper": "Canadian Rapper",
        "saved-by-the-80s": "Saved by the 80s",
        "saved-by-the-70s": "Saved by the 70s",
        "arctic-slate": "Arctic Slate",
        "saved-by-the-90s": "Saved by the 90s"
    };
    var root = document.documentElement;
    var buttons = document.querySelectorAll("[data-palette]");
    var status = document.getElementById("themeStatus");

    function apply(id) {
        if (!names[id]) {
            root.removeAttribute("data-palette");
            id = "";
        } else {
            root.setAttribute("data-palette", id);
        }
        for (var i = 0; i < buttons.length; i++) {
            var on = buttons[i].getAttribute("data-palette") === id;
            buttons[i].setAttribute("aria-pressed", on ? "true" : "false");
        }
        if (status) {
            status.textContent = id ? names[id] : "BassLab colors";
        }
    }

    var saved = "";
    try {
        saved = localStorage.getItem(KEY) || "";
    } catch (err) {
        saved = "";
    }
    if (names[saved]) {
        apply(saved);
    }

    for (var j = 0; j < buttons.length; j++) {
        buttons[j].addEventListener("click", function () {
            var id = this.getAttribute("data-palette");
            try {
                localStorage.setItem(KEY, id);
            } catch (err) {}
            apply(id);
        });
    }
})();
