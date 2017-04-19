(function () {

  angular
    .module('jwShowcase.chromecast')
    .component('jwCastingIcon', {
      controller:   CastingIconController,
      controllerAs: 'vm',
      templateUrl:  'views/chromecast/castingIcon.html'
    });

  CastingIconController.$inject = ['chromecast', '$scope', '$q', 'popup', '$timeout'];

  function CastingIconController(chromecast, $scope, $q, popup, $timeout) {
    this.state          = 0;
    this.volume         = 0;
    this.activeDevice   = null;
    this.connectingIcon = '1';
    this.castingModal   = null;
    this.mediaState     = null;
    this.mediaInfo      = null;

    var connectingCounter = 0;
    var self = this;
    var swapTimeout;

    document.addEventListener("deviceready", function () {
      $timeout(function() {
        self.states = chromecast.states;
        self.devices = chromecast.devices;

        chromecast.cast.getDevices().then(function(devices) {
          if (devices.length) {
            self.devices = devices;
          }
        });
      }, 20);
    }, false);

    this.chooseDevice = function(deviceObject) {
      if (self.castingModal) {
        self.castingModal.close();

        self.castingModal = null;
      }

      chromecast.cast.selectDevice(deviceObject);
    };

    this.closePopup = function() {
      if (this.castingModal) {
        this.castingModal.close();
      }
    };

    this.stopCasting = function() {
      chromecast.cast.endSessionAndStopCasting();

      this.closePopup();
    };

    this.playPause = function() {
      if (self.mediaState.playerState === 3) {
        chromecast.cast.play();
      } else {
        chromecast.cast.pause();
      }
    };

    this.tapIcon = function() {
      if (self.state === self.states.SESSION_STATE_CONNECTING) {
        return;
      }

      var defer = $q.defer();
      self.castingDialogTitle = self.activeDevice ? self.activeDevice.friendlyName : 'Cast to';

      self.castingModal = popup.open({
        cssClass: 'jw-casting-modal',
        scope: $scope,
        templateUrl: 'views/chromecast/castingDeviceList.html'
      });
    };

    this.changeVolume = function() {
      chromecast.cast.setStreamVolume(this.volume / 100);
    };

    function swapConnecting() {
      $scope.$apply(function() {
        self.connectingIcon = (connectingCounter++ % 3) + 1;
      });

      swapTimeout = setTimeout(swapConnecting, 750);
    }

    document.addEventListener('cast.session.changed', function (event) {
      var state = chromecast.cast.getSessionState();

      if (state !== self.states.SESSION_STATE_CONNECTING) {
        clearTimeout(swapTimeout);
      } else {
        self.closePopup();

        swapConnecting();
      }

      $scope.$apply(function() {
        self.state        = state;
        self.mediaState   = chromecast.cast.getMediaState();
        self.mediaInfo    = self.mediaState ? self.mediaState.mediaInformation : null;
        self.activeDevice = chromecast.cast.getActiveDevice();
      });
    });

    document.addEventListener('cast.media.updated', function (event) {
      $scope.$apply(function() {
        self.mediaState = event.detail.status;
        self.mediaInfo  = self.mediaState ? self.mediaState.mediaInformation : null;
        self.volume     = self.mediaState.volume * 100;
      });
    });

    document.addEventListener('cast.devices.changed', function () {
      $scope.$apply();
    });
  }
}());
