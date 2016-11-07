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
        .directive('jwCardSlider', cardSliderDirective);

    /**
     * @ngdoc directive
     * @name jwShowcase.core.directive:jwCardSlider
     * @module jwShowcase.core
     *
     * @description
     * # jwCardSlider
     * The `jwCardSlider` can be used to create a horizontal list of cards which can be moved horizontally. Each item
     * will be rendered in the {@link jwShowcase.core.directive:jwCard `jwCard`} directive.
     *
     * @scope
     *
     * @param {jwShowcase.core.feed}       feed            Feed which will be displayed in the slider.
     * @param {boolean|string=}     heading         Text which will be displayed in the title or false if no title
     *                                              should be displayed.
     *
     * @param {Object|number=}      cols            How many columns should be visible. Can either be a fixed number or
     *                                              an object with responsive columns (e.g. `{sm: 2, md: 4}`).
     *                                              Available sizes; xs, sm, md, lg and xl.
     *
     * @param {boolean=}            featured        Featured slider flag
     * @param {boolean=}            watchProgress   Show watch progress in card
     * @param {function=}           onCardClick     Function which is being called when the user clicks on a card.
     *
     * @requires $timeout
     * @requires jwShowcase.core.utils
     *
     * @example
     *
     * ```
     * <jw-card-slider feed="vm.feed" cols="1" featured="true"></jw-card-slider>
     * <jw-card-slider feed="vm.feed" cols="{xs: 2, sm: 3}" featured="false" heading="'Videos'"></jw-card-slider>
     * ```
     */

    cardSliderDirective.$inject = ['$timeout', 'utils'];
    function cardSliderDirective ($timeout, utils) {

        return {
            scope:            {
                heading:       '=?',
                feed:          '=',
                watchProgress: '=',
                cols:          '=',
                featured:      '=',
                onCardClick:   '='
            },
            replace:          true,
            controller:       angular.noop,
            controllerAs:     'vm',
            bindToController: true,
            templateUrl:      'views/core/cardSlider.html',
            link:             link
        };

        function link (scope, element) {

            var cols              = 0,
                index             = 0,
                startCoords       = null,
                animation         = null,
                translateX        = 0,
                sliding           = false,
                forEach           = angular.forEach,
                $                 = element[0].querySelector.bind(element[0]),
                resizeDebounced   = utils.debounce(resize, 100);

            scope.vm.slideLeft    = slideLeft;
            scope.vm.slideRight   = slideRight;
            scope.vm.slideToIndex = slideToIndex;

            activate();

            ////////////////////////

            /**
             * Initialize the directive.
             */
            function activate () {

                var classNameSuffix = scope.vm.featured ? 'featured' : 'default',
                    className       = 'jw-card-slider--' + classNameSuffix;

                window.addEventListener('resize', resizeDebounced);

                $('.jw-card-slider-container').addEventListener('touchstart', onTouchStart, false);

                element.addClass(className);

                if (scope.vm.featured) {

                    angular.element($('.jw-card-slider-indicators'))
                        .addClass('is-visible');
                }

                scope.$on('$destroy', destroy);
                scope.$watch('vm.feed', function () {
                    resizeDebounced();
                    updateSlides();
                }, true);

                $timeout(resize, 50);
            }

            /**
             * Handle $destroy event
             */
            function destroy () {

                window.removeEventListener('resize', resizeDebounced);
            }

            /**
             * Slide amount of cols to the left
             */
            function slideLeft () {

                if (canSlideLeft()) {
                    index = Math.max(0, index - cols);
                    update(true);
                }
            }

            /**
             * Slide amount of cols to the right
             */
            function slideRight () {

                if (canSlideRight()) {
                    index = Math.min(getMaxIndex(), index + cols);
                    update(true);
                }
            }

            /**
             * Slide to the given index
             * @param {number} toIndex
             */
            function slideToIndex (toIndex) {

                if (toIndex !== index) {
                    index = Math.min(getMaxIndex(), Math.max(0, toIndex));
                    update(true);
                }
            }

            /**
             * Returns true if the slider can slide to the left
             * @returns {boolean}
             */
            function canSlideLeft () {

                return index > 0;
            }

            /**
             * Returns true if the slider can slide to the right
             * @returns {boolean}
             */
            function canSlideRight () {

                return index < getMaxIndex();
            }

            /**
             * Update slider and slides
             * @param {boolean} animate Animate the slider to the new position
             */
            function update (animate) {

                var offset = (index * (100 / cols));

                translateX = offset * -1;

                updateIndicator();
                updateSlides();

                $('.jw-card-slider-button--left').classList[canSlideLeft() ? 'remove' : 'add']('is-disabled');
                $('.jw-card-slider-button--right').classList[canSlideRight() ? 'remove' : 'add']('is-disabled');

                moveSlider(translateX, animate);
            }

            /**
             * Update all slides
             */
            function updateSlides () {

                forEach($('.jw-card-slider-list').children, function (slide, slideIndex) {

                    var lastIndex           = index + cols,
                        offset              = scope.vm.featured ? 2 : 1,
                        isVisible           = slideIndex >= index && slideIndex < lastIndex,
                        isPosterVisible     = slideIndex >= index - offset && slideIndex < lastIndex + offset,
                        isVisibleFunc       = isVisible ? 'add' : 'remove',
                        isPosterVisibleFunc = isPosterVisible ? 'add' : 'remove';

                    slide.classList[isVisibleFunc]('is-visible');
                    slide.classList[isPosterVisibleFunc]('is-poster-visible');
                });
            }

            /**
             * Update the indicator
             */
            function updateIndicator () {

                var indicator = $('.jw-card-slider-indicators');

                if (!indicator) {
                    return;
                }

                forEach(indicator.children, function (indicator, indicatorIndex) {

                    var isActive = indicatorIndex >= index && indicatorIndex < index + cols,
                        func     = isActive ? 'add' : 'remove';

                    indicator.classList[func]('is-active');
                });
            }

            /**
             * Handle resize event
             */
            function resize () {

                var slider = $('.jw-card-slider-list'),
                    toCols = scope.vm.cols,
                    className;

                if (angular.isObject(toCols)) {
                    toCols = utils.getValueForScreenSize(toCols, 1);
                }

                if (cols === toCols) {
                    return;
                }

                cols      = toCols;
                className = 'slides-' + cols;

                slider.className = 'jw-card-slider-list ' + className;

                update(false);
            }

            /**
             * Handle touchstart event
             * @param {Event} event
             */
            function onTouchStart (event) {

                var coords         = getCoords(event),
                    touchContainer = $('.jw-card-slider-container');

                touchContainer.addEventListener('touchmove', onTouchMove);
                touchContainer.addEventListener('touchend', onTouchEnd);
                touchContainer.addEventListener('touchcancel', onTouchCancel);

                startCoords = coords;
                element.addClass('is-sliding');
            }

            /**
             * Handle touchmove event
             * @param {Event} event
             */
            function onTouchMove (event) {

                var coords         = getCoords(event),
                    distanceX      = startCoords.x - coords.x,
                    distanceY      = startCoords.y - coords.y,
                    deltaX         = Math.abs(distanceX),
                    deltaY         = Math.abs(distanceY),
                    sliderWidth    = $('.jw-card-slider-list').offsetWidth,
                    containerWidth = $('.jw-card-slider-container').offsetWidth;

                if (!sliding) {
                    if (deltaY > 20) {
                        afterTouchEnd();
                        update(false);
                    }
                    else if (deltaX > 20) {
                        sliding = true;
                    }
                    return;
                }

                event.preventDefault();

                // first item
                if (index === 0 && distanceX < 0) {
                    distanceX = Math.min(50, easeOutDistance(deltaX, containerWidth)) * -1;
                }
                // last item
                else if (index >= getMaxIndex() && distanceX > 0) {
                    distanceX = Math.min(50, easeOutDistance(deltaX, containerWidth));
                }

                var percentageOffset = (distanceX / sliderWidth) * 100;

                moveSlider(translateX - percentageOffset, false);
            }

            /**
             * Handle touchend event
             * @param {Event} event
             */
            function onTouchEnd (event) {

                var coords   = getCoords(event),
                    distance = startCoords.x - coords.x;

                if (distance < -50 && canSlideLeft()) {
                    slideLeft();
                }
                else if (distance > 50 && canSlideRight()) {
                    slideRight();
                }
                else {
                    update(true);
                }

                afterTouchEnd();
            }

            /**
             * Handle touchcancel event
             */
            function onTouchCancel () {

                update(true);
                afterTouchEnd();
            }

            /**
             * Remove touch event listeners and remove className 'is-hiding'
             */
            function afterTouchEnd () {

                var touchContainer = $('.jw-card-slider-container');

                startCoords = null;

                touchContainer.removeEventListener('touchmove', onTouchMove);
                touchContainer.removeEventListener('touchend', onTouchEnd);
                touchContainer.removeEventListener('touchcancel', onTouchCancel);

                sliding           = false;

                element.removeClass('is-sliding');
            }

            /**
             * Move the slider to the given offset with or without animation.
             * @param {number} offset New offset in pixels
             * @param {boolean} animate Animate flag
             */
            function moveSlider (offset, animate) {

                var listElement = $('.jw-card-slider-list');

                if (animation && animation._active) {
                    animation.kill();
                }

                animation = window.TweenLite
                    .to(listElement, animate ? 0.3 : 0, {x: offset + '%', z: 0.01});
            }

            /**
             * Return max slide index
             * @returns {number}
             */
            function getMaxIndex () {

                return scope.vm.feed.playlist.length - cols;
            }

            /**
             * Get coords object from native touch event. Original code from ngTouch.
             *
             * @param {Event} event
             * @returns {{x: (number), y: (number)}}
             */
            function getCoords (event) {

                var originalEvent = event.originalEvent || event,
                    touches       = originalEvent.touches && originalEvent.touches.length ? originalEvent.touches
                        : [originalEvent],
                    e             = (originalEvent.changedTouches && originalEvent.changedTouches[0]) || touches[0];

                return {
                    x: e.clientX,
                    y: e.clientY
                };
            }

            /**
             * Ease out the given distance
             *
             * @param {number} current Current distance
             * @param {number} total Total distance
             * @returns {number}
             */
            function easeOutDistance (current, total) {

                return Math.sin((0.5 / total) * current) * current;
            }
        }
    }

}());
