(function () {

  angular
    .module('jwShowcase.chromecast')
    .component('jwCastingMiniController', {
      controller:   CastingMiniControllerController,
      controllerAs: 'vm',
      templateUrl:  'views/chromecast/castingMiniController.html'
    });

  CastingMiniControllerController.$inject = ['chromecast', '$scope', '$ionicModal', '$timeout'];

  function CastingMiniControllerController(chromecast, $scope, $ionicModal, $timeout) {
    this.mediaState   = null;
    this.mediaInfo    = null;
    this.activeDevice = null;
    this.progress     = 0;

    var self = this;

    this.openExpandedControler = function() {
      $ionicModal.fromTemplateUrl('views/chromecast/castingExpandedController.html', {
        scope: $scope,
        animation: 'slide-in-up'
      }).then(function(modal) {
        self.modal = modal;
        self.modal.show();
      });
    };

    this.hideModal = function() {
      if (!self.modal) {
        return;
      }

      self.modal.hide();
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
