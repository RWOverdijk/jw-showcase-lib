(function () {

  angular
    .module('jwShowcase.chromecast')
    .component('jwCastingMiniController', {
      controller:   CastingMiniControllerController,
      controllerAs: 'vm',
      templateUrl:  'views/chromecast/castingMiniController.html'
    });

  CastingMiniControllerController.$inject = ['chromecast', '$scope', 'popup', '$timeout'];

  function CastingMiniControllerController(chromecast, $scope, popup, $timeout) {
    this.mediaState   = null;
    this.mediaInfo    = null;
    this.activeDevice = null;
    this.progress     = 0;

    var self = this;

    this.openExpandedControler = function() {
      self.modal = popup.open({
        scope: $scope,
        templateUrl: 'views/chromecast/castingExpandedController.html'
      });
    };

    this.hideModal = function() {
      if (!self.modal) {
        return;
      }

      self.modal.close();
    };

    this.queueNext = function() {
      chromecast.cast.queueNextItem();
    };

    this.queuePrevious = function() {
      chromecast.cast.queuePreviousItem();
    };

    this.seek = function() {
      chromecast.cast.seekToTimeInterval(this.mediaState.streamPosition);
    };

    this.playPause = function() {
      if (self.mediaState.playerState === 3) {
        chromecast.cast.play();
      } else {
        chromecast.cast.pause();
      }
    };

    document.addEventListener('cast.media.updated', function (event) {
      $scope.$apply(function() {
        self.mediaState = event.detail.status;
        self.mediaInfo  = self.mediaState ? self.mediaState.mediaInformation : null;
        self.progress   = self.mediaInfo ? ((self.mediaState.streamPosition / self.mediaInfo.streamDuration) * 100) : 0;
      });
    });

    document.addEventListener('cast.session.changed', function () {
      $scope.$apply(function() {
        self.mediaState   = chromecast.cast.getMediaState();
        self.mediaInfo    = self.mediaState ? self.mediaState.mediaInformation : null;
        self.activeDevice = chromecast.cast.getActiveDevice();

        if (!self.activeDevice) {
          self.hideModal();
        }
      });
    });
  }
}());
