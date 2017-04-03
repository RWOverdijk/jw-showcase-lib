/**
 * Copyright 2017 Longtail Ad Solutions Inc.
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

    angular
        .module('jwShowcase.core')
        .filter('secondsToDate', secondsToDate);

    /**
     * @ngdoc filter
     * @name jwShowcase.core.filter:secondsToDate
     * @module jwShowcase.core
     *
     * @description
     * Get a new Date instance based on seconds
     */
    function secondsToDate (utils) {
        return function(seconds) {
            return new Date(1970, 0, 1).setSeconds(seconds);
        };
    }

}());
