angular
    .module("menu", [])
    .constant("optList", {
        textSeparator: " - ",
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
        }
    }])
    .factory("splitService", ["optList", function(optList) {
        return function(line) {
            var vals = line.split(optList.textSeparator);
            return {
                name: vals[0],
                descrription: vals[1],
                price: parseInt(vals[2])
            }
        }
    }])
    .factory("buildService", ["fetchService", "splitService", function(fetchService, splitService) {
        var obj;
        return function() {
            var result = [],
                i, l;
            fetchService.query()
                .then(function(success) {
                    obj = success.data.response;
                }, function(error) {
                    console.log('something went wrong');
                    console.log(error);
                })
                .then(function() {
                    console.log(obj);
                    for (i = 0, l = obj.items.length; i < l; i++) {
                    	if(obj.items[i].text.length < 3){
                    		continue;
                    	}
                        result.push(angular.extend({
                            minPic: obj.items[i].photo_130,
                            maxPic: obj.items[i].photo_604
                        }, splitService(obj.items[i].text)));
                    }
                    //console.log(result);
                    this.data = result;
                });
        }
    }])
    .controller("mainCtrl", ["buildService", function(buildService) {
        var self = this;
        this.data;
        buildService();
        console.log(this.data);
    }]);


//"https://api.vk.com/method/photos.get?owner_id=-54288406&album_id=174507840&v=5.44&callback=JSON_CALLBACK"
