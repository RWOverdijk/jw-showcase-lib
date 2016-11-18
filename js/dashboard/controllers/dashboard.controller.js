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

    angular
        .module('jwShowcase.dashboard')
        .controller('DashboardController', DashboardController);

    /**
     * @ngdoc controller
     * @name jwShowcase.dashboard.controller:DashboardController
     *
     * @requires ui.router.state.$state
     * @requires jwShowcase.core.dataStore
     */
    DashboardController.$inject = ['$scope', '$state', '$ionicHistory', 'dataStore', 'userSettings'];
    function DashboardController ($scope, $state, $ionicHistory, dataStore, userSettings) {

        var vm = this;

        vm.dataStore          = dataStore;
        vm.userSettings       = userSettings;

        vm.cardClickHandler   = cardClickHandler;

        activate();

        ////////////

        function activate () {

            $scope.$on('$ionicView.enter', function () {
                $ionicHistory.clearHistory();
            });
        }

        /**
         * Handle click event on cards
         *
         * @param {jwShowcase.core.item}   item        Clicked item
         * @param {boolean}         autoStart   Should the video playback start automatically
         */
        function cardClickHandler (item, autoStart) {

            $state.go('root.video', {
                feedId:    item.$feedid || item.feedid,
                mediaId:   item.mediaid,
                autoStart: autoStart
            });
        }
    }

}());