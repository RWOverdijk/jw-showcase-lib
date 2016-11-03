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
        .module('jwShowcase.core')
        .controller('HeaderBackButtonController', HeaderBackButtonController);

    /**
     * @ngdoc controller
     * @name jwShowcase.core.controller:HeaderBackButtonController
     *
     * @requires $state
     * @requires $ionicHistory
     * @requires $ionicViewSwitcher
     */

    HeaderBackButtonController.$inject = ['$state', '$ionicHistory', '$ionicViewSwitcher'];
    function HeaderBackButtonController ($state, $ionicHistory, $ionicViewSwitcher) {

        var vm   = this;

        vm.backButtonClickHandler = backButtonClickHandler;

        ////////////////

        /**
         * Handle click on back button
         */
        function backButtonClickHandler () {

            var viewHistory = $ionicHistory.viewHistory(),
                history     = viewHistory.histories[$ionicHistory.currentHistoryId()],
                stack       = history ? history.stack : [],
                stackIndex  = history.cursor - 1;

            if (viewHistory.backView && viewHistory.backView.stateName !== 'root.video') {

                $ionicHistory.goBack();
                return;
            }

            if (stackIndex > 0) {

                while (stackIndex >= 0) {

                    // search until dashboard or feed state is found
                    if (stack[stackIndex].stateName !== 'root.video' && stack[stackIndex].stateId !== viewHistory.currentView.stateId) {
                        $ionicViewSwitcher.nextDirection('back');
                        stack[stackIndex].go();
                        return;
                    }

                    stackIndex--;
                }
            }

            goToDashboard();
        }

        /**
         * Go to dashboard state with back transition
         */
        function goToDashboard () {

            $ionicViewSwitcher.nextDirection('back');
            $state.go('root.dashboard');
        }
    }

})();
