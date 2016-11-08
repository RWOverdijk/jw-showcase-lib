/**
 * Copyright 2015 Longtail Ad Solutions Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 * express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 **/

(function () {

    var LOCAL_STORAGE_KEY       = 'jwshowcase.watchprogress';
    var WATCH_PROGRESS_LIFETIME = 86400000 * 30;
    var WATCH_PROGRESS_MIN      = 0.01;
    var WATCH_PROGRESS_MAX      = 0.95;

    angular
        .module('jwShowcase.core')
        .service('watchProgress', watchProgress);

    /**
     * @ngdoc service
     * @name jwShowcase.core.watchProgress
     *
     * @requires jwShowcase.core.dataStore
     */
    watchProgress.$inject = ['dataStore', 'session'];
    function watchProgress (dataStore, session) {

        this.WATCH_PROGRESS_MAX = WATCH_PROGRESS_MAX;
        this.WATCH_PROGRESS_MIN = WATCH_PROGRESS_MIN;

        this.saveItem   = saveItem;
        this.removeItem = removeItem;
        this.getItem    = getItem;
        this.hasItem    = hasItem;
        this.restore    = restore;
        this.clearAll   = clearAll;

        ////////////////

        /**
         * @param {jwShowcase.core.item} item
         * @private
         */
        function findProgressIndex (item) {

            var playlist = dataStore.watchProgressFeed.playlist;

            return playlist.findIndex(function (current) {
                return current.mediaid === item.mediaid;
            });
        }

        /**
         * @ngdoc property
         * @name jwShowcase.core.watchProgress#hasItem
         * @propertyOf jwShowcase.core.watchProgress
         *
         * @description
         * Returns true if given item has saved watchProgress
         */
        function hasItem (item) {

            return findProgressIndex(item) !== -1;
        }

        /**
         * @ngdoc property
         * @name jwShowcase.core.watchProgress#saveItem
         * @propertyOf jwShowcase.core.watchProgress
         *
         * @description
         * Save item to watchProgress
         */
        function saveItem (item, progress) {

            var playlist = dataStore.watchProgressFeed.playlist,
                clone    = angular.extend({}, item),
                index    = findProgressIndex(item);

            if (index !== -1) {
                playlist[index].progress    = progress;
                playlist[index].lastWatched = +new Date();
            }
            else {
                clone.$feedid     = clone.$feedid || clone.feedid;
                clone.feedid      = 'continue-watching';
                clone.progress    = progress;
                clone.lastWatched = +new Date();

                playlist.unshift(clone);
            }

            playlist.sort(sortOnLastWatched);

            persist();
        }

        /**
         * Get watch progress item or undefined
         * @param {jwShowcase.core.item} item
         *
         * @returns {jwShowcase.core.item}
         */
        function getItem (item) {

            var index    = findProgressIndex(item),
                playlist = dataStore.watchProgressFeed.playlist;

            return playlist[index];
        }

        /**
         * @ngdoc property
         * @name jwShowcase.core.watchProgress#removeItem
         * @propertyOf jwShowcase.core.watchProgress
         *
         * @description
         * Remove item from watchProgress feed
         */
        function removeItem (item) {

            var playlist = dataStore.watchProgressFeed.playlist,
                index    = findProgressIndex(item);

            if (index !== -1) {
                playlist.splice(index, 1);
                persist();
            }
        }

        /**
         * @ngdoc property
         * @name jwShowcase.core.watchProgress#clearAll
         * @propertyOf jwShowcase.core.watchProgress
         *
         * @description
         * Remove all items from watchProgress feed and localStorage
         */
        function clearAll () {

            dataStore.watchProgressFeed.playlist = [];
            persist();
        }

        /**
         * @ngdoc property
         * @name jwShowcase.core.watchProgress#persist
         * @propertyOf jwShowcase.core.watchProgress
         *
         * @description
         * Persist watchProgress to localStorage
         */
        function persist () {

            var data = dataStore.watchProgressFeed.playlist.map(function (item) {
                return {
                    mediaid:     item.mediaid,
                    feedid:      item.$feedid,
                    progress:    item.progress,
                    lastWatched: item.lastWatched
                };
            });

            session.save(LOCAL_STORAGE_KEY, data);
        }

        /**
         * @ngdoc property
         * @name jwShowcase.core.watchProgress#restore
         * @propertyOf jwShowcase.core.watchProgress
         *
         * @description
         * Restores watchProgress from localStorage
         */
        function restore () {

            var time = +new Date();

            session.load(LOCAL_STORAGE_KEY, [])
                .filter(isValid)
                .sort(sortOnLastWatched)
                .map(function (keys) {

                    // dataStore#getItem already returns a clone of the item
                    var item = dataStore.getItem(keys.mediaid, keys.feedid);

                    if (item) {
                        item.progress    = keys.progress;
                        item.lastWatched = keys.lastWatched;

                        dataStore.watchProgressFeed.playlist.push(item);
                    }
                });

            /**
             * Test if the given item from localStorage is valid
             *
             * @param {Object} item
             * @returns {boolean}
             */
            function isValid (item) {

                // item contains keys
                if (!item.mediaid || !item.feedid) {
                    return false;
                }

                // if progress is out range
                if (item.progress < WATCH_PROGRESS_MIN || item.progress > WATCH_PROGRESS_MAX) {
                    return false;
                }

                // filter out older items older than lifetime
                return time - item.lastWatched < WATCH_PROGRESS_LIFETIME
            }
        }

        /**
         * Sort on last watched value DESC
         *
         * @param {jwShowcase.core.item} a
         * @param {jwShowcase.core.item} b
         *
         * @returns {boolean}
         */
        function sortOnLastWatched (a, b) {

            return a.lastWatched < b.lastWatched;
        }
    }
})();
