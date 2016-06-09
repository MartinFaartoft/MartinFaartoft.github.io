var Framework;
(function (Framework) {
    var ResourceManager = (function () {
        function ResourceManager() {
            this.cache = {};
            this.readyCallbacks = [];
        }
        ResourceManager.prototype.preload = function (urls) {
            var _this = this;
            var _loop_1 = function(url) {
                if (!this_1.cache[url]) {
                    var img_1 = new Image();
                    img_1.onload = function () {
                        _this.cache[url] = img_1;
                        if (_this.isReady()) {
                            for (var _i = 0, _a = _this.readyCallbacks; _i < _a.length; _i++) {
                                var cb = _a[_i];
                                cb();
                            }
                        }
                    };
                    this_1.cache[url] = false;
                    img_1.src = url;
                }
            };
            var this_1 = this;
            for (var _i = 0, urls_1 = urls; _i < urls_1.length; _i++) {
                var url = urls_1[_i];
                _loop_1(url);
            }
        };
        ResourceManager.prototype.get = function (url) {
            return this.cache[url];
        };
        ResourceManager.prototype.onReady = function (callback) {
            this.readyCallbacks.push(callback);
        };
        ResourceManager.prototype.isReady = function () {
            for (var k in this.cache) {
                if (this.cache.hasOwnProperty(k) && !this.cache[k]) {
                    return false;
                }
            }
            return true;
        };
        return ResourceManager;
    }());
    Framework.ResourceManager = ResourceManager;
})(Framework || (Framework = {}));
//# sourceMappingURL=resourcemanager.js.map