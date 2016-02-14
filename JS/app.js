angular
    .module("menu", [])
    .constant("optList", {
        textSeparator: " -",
        config: {
            method: "JSONP",
            url: "https://api.vk.com/method/photos.get",
            params: {
                owner_id: "-54288406",
                album_id: "174507840",
                v: "5.44",
                callback: "JSON_CALLBACK"
            }
        }
    })
    .factory("fetchService", ["$http", "optList", function($http, optList) {
        return {
            query: function() {
                return $http(optList.config);
            }
        };
    }])
    .filter("split", ["optList", function(optList) {
        return function(line) {
            var vals = line.split(optList.textSeparator);
            return {
                name: vals[0],
                descrription: (function() {
                    if (vals[1]) {
                        return vals[1].replace(/\,(?=\S)/g, ", ");
                    }
                })(),
                price: parseInt(vals[2])
            };
        };
    }])
    .factory("buildService", ["fetchService", "splitFilter", function(fetchService, splitFilter) {
        var result = [],
            obj;
        fetchService.query()
            .then(function(success) {
                obj = success.data.response;
                var i, l;
                for (i = 0, l = obj.items.length; i < l; i++) {
                    if (obj.items[i].text.length < 3) {
                        continue;
                    }
                    result.push(angular.extend({
                        id: i,
                        minPic: obj.items[i].photo_130,
                        maxPic: obj.items[i].photo_604
                    }, splitFilter(obj.items[i].text)));
                }
            }, function(error) {
                console.log('something went wrong');
                console.log(error);
            });
        return {
            getAll: function() {
                return result;
            }
        };

    }])
    .factory("orderService", [function() {
        var orderObj = {};
        return {
            add: function(item) {
                if (!orderObj[item.id]) {
                    orderObj[item.id] = {
                        name: item.name,
                        price: item.price,
                        qty: 1
                    };
                } else {
                    orderObj[item.id].qty += 1;
                }
                console.log(orderObj);
            },
            remove: function(item) {
                var position = orderObj[item.id];
                if (position) {
                    if (position.qty > 1) {
                        position.qty -= 1;
                    } else {
                        delete orderObj[item.id];
                    }
                } else {
                    console.log('impossible');
                }
            },
            get: function() {
                return orderObj;
            }
        };
    }])
    .controller("mainCtrl", ["buildService","orderService", function(buildService, orderService) {
        var self = this;
        self.data = buildService.getAll();
        self.add = orderService.add;
    }])
    .controller("orderCtrl", ["orderService", function(orderService) {
        var self = this;
        self.listOrder = orderService.get();
    }]);

//"https://api.vk.com/method/photos.get?owner_id=-54288406&album_id=174507840&v=5.44&callback=JSON_CALLBACK"
