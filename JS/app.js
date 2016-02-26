angular
    .module("menu", [])
    .constant("optList", {
        textSeparator: " -",
        curSymbol: "р.",
        configAlbum: {
            method: "JSONP",
            url: "https://api.vk.com/method/photos.get",
            params: {
                owner_id: "-54288406",
                album_id: "174507840",
                v: "5.44",
                callback: "JSON_CALLBACK"
            }
        },
        configDetails: {
            method: "JSONP",
            url: "https://api.vk.com/method/groups.getById",
            params: {
                group_id: "54288406",
                v: "5.44",
                callback: "JSON_CALLBACK"
            }
        }
    })
    .factory("fetchService", ["$http", "optList", function($http, optList) {
        return {
            queryAlbum: function() {
                return $http(optList.configAlbum);
            },
            queryDetails: function() {
                return $http(optList.configDetails);
            }
        };
    }])
    .filter("split", ["optList", function(optList) {
        return function(line) {
            var vals = line.split(optList.textSeparator);
            return {
                name: vals[0],
                descrription: (vals[1] ? vals[1].replace(/\,(?=\S)/g, ", ") : ""),
                price: parseInt(vals[2], 10) || 0
            };
        };
    }])
    .filter("rub", ["optList", function(optList) {
        return function(numb) {
            return numb + optList.curSymbol;
        };
    }])
    .factory("buildService", ["fetchService", "splitFilter", function(fetchService, splitFilter) {
        var album = [],
            details,
            obj;
        fetchService.queryAlbum()
            .then(function(success) {
                obj = success.data.response;
                var i, l;
                for (i = 0, l = obj.items.length; i < l; i++) {
                    if (obj.items[i].text.length < 3) {
                        continue;
                    }
                    album.push(angular.extend({
                        id: i,
                        minPic: obj.items[i].photo_130,
                        maxPic: obj.items[i].photo_604
                    }, splitFilter(obj.items[i].text)));
                }
            }, function(error) {
                console.log('something went wrong');
                console.log(error);
            });
        fetchService.queryDetails()
            .then(function(success) {
                details = success.data.response[0];
            }, function(error) {
                console.log('something went wrong');
                console.log(error);
            });

        return {
            getAlbum: function() {
                return album;
            },
            getDetails: function() {
                return details;
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
                        qty: 1,
                        id: item.id
                    };
                } else {
                    orderObj[item.id].qty += 1;
                }
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
            },
            getTotal: function() {
                var total = 0;
                if (Object.keys(orderObj).length > 0) {
                    for (var pos in orderObj) {
                        if (orderObj.hasOwnProperty(pos)) {
                            total += orderObj[pos].price * orderObj[pos].qty;
                        }
                    }
                }
                return total;
            }
        };
    }])
    .directive("orderWidget", [function() {
        return {
            templateUrl: "templates/orderWidget.html"
        };
    }])
    .controller("mainCtrl", ["buildService", "orderService", function(buildService, orderService) {
        var self = this;
        self.showPic = false;
        self.orderMobileWidget = true;
        self.data = buildService.getAlbum;
        self.getTotal = orderService.getTotal;
        self.listOrder = orderService.get;
        self.add = orderService.add;
        self.remove = orderService.remove;
        self.siteDetails = buildService.getDetails;

        self.showMaxPic = function(url) {
            if (!url) {
                self.showPic = false;
                self.pic = "#";
            } else {
                self.pic = url;
                self.showPic = true;
            }
        };
    }]);
