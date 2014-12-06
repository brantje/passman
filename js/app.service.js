app.factory('shareService', ['$http', function ($http) {
    return {
        shareItem: function (item) {
            var queryUrl = OC.generateUrl('apps/passman/api/v1/sharing/share');
            return $http({
                url: queryUrl,
                method: 'PUT',
                data: item
            });
        }
        getSharingSettings: function () {
            var queryUrl = OC.generateUrl('apps/passman/api/v1/sharing/settings');
            return $http({
                url: queryUrl,
                method: 'get'
            });
        }
    };
}]);

app.factory('ItemService', ['$http',
    function ($http) {
        return {
            getItems: function (tags, showDeleted) {
                var queryUrl = (!showDeleted) ? OC.generateUrl('apps/passman/api/v1/getbytags?tags=' + tags.join(',')) : OC.generateUrl('apps/passman/api/v1/items/getdeleted?tags=' + tags.join(','));
                return $http({
                    url: queryUrl,
                    method: 'GET'
                });
            },
            update: function (item) {
                return $http({
                    url: OC.generateUrl('apps/passman/api/v1/item/' + item.id),
                    data: item,
                    method: 'PATCH'
                });
            },
            softDestroy: function (item) {
                item.delete_date = Math.floor(new Date().getTime() / 1000);
                return $http({
                    url: OC.generateUrl('apps/passman/api/v1/item/' + item.id),
                    data: item,
                    method: 'PATCH'
                });
            },
            recover: function (item) {
                item.delete_date = 0;
                return $http({
                    url: OC.generateUrl('apps/passman/api/v1/item/' + item.id),
                    data: item,
                    method: 'PATCH'
                });
            },
            destroy: function (item) {
                return $http({
                    url: OC.generateUrl('apps/passman/api/v1/item/delete/' + item.id),
                    method: 'DELETE'
                });
            },
            create: function (item) {
                return $http({
                    url: OC.generateUrl('apps/passman/api/v1/item'),
                    data: item,
                    method: 'PUT'
                });
            },
            removeCustomfield: function (id) {
                return $http({
                    url: OC.generateUrl('apps/passman/api/v1/item/field/delete/' + id),
                    method: 'DELETE'
                });
            },
            getFile: function (id) {
                return $http({
                    url: OC.generateUrl('/apps/passman/api/v1/item/file/' + id),
                    method: 'GET'
                });
            },
            uploadFile: function (file) {
                return $http({
                    url: OC.generateUrl('apps/passman/api/v1/item/' + file.item_id + '/addfile'),
                    method: 'PUT',
                    data: file
                });
            },
            deleteFile: function (file) {
                return $http({
                    url: OC.generateUrl('apps/passman/api/v1/item/file/' + file.id),
                    method: 'DELETE'
                });
            }
        };
    }]);
app.factory('TagService', ['$http',
    function ($http) {
        return {
            getTag: function (tag) {
                return $http({
                    url: OC.generateUrl('apps/passman/api/v1/tag/load?tag=' + tag),
                    method: 'GET'
                });
            },
            update: function (tag) {
                return $http({
                    url: OC.generateUrl('apps/passman/api/v1/tag/update'),
                    method: 'PATCH',
                    data: tag
                });
            }
        };
    }]);