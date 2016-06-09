"use strict";
var Framework;
(function (Framework) {
    function isKeyDown(key) {
        return pressedKeys[key.toUpperCase()];
    }
    Framework.isKeyDown = isKeyDown;
})(Framework || (Framework = {}));
var pressedKeys = {};
(function () {
    function setKey(event, status) {
        var code = event.keyCode;
        var key;
        switch (code) {
            case 32:
                key = "SPACE";
                break;
            case 37:
                key = "LEFT";
                break;
            case 38:
                key = "UP";
                break;
            case 39:
                key = "RIGHT";
                break;
            case 40:
                key = "DOWN";
                break;
            default:
                // Convert ASCII codes to letters
                key = String.fromCharCode(code);
        }
        pressedKeys[key] = status;
    }
    document.addEventListener("keydown", function (e) {
        setKey(e, true);
    });
    document.addEventListener("keyup", function (e) {
        setKey(e, false);
    });
    window.addEventListener("blur", function () {
        pressedKeys = {};
    });
})();
//# sourceMappingURL=input.js.map