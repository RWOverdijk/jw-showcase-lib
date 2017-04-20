(function() {
  angular
    .module('jwShowcase.chromecast')
    .service('chromecast', chromecast);

  chromecast.$inject = [];

  function chromecast() {
    var self = this;

    document.addEventListener('deviceready', function () {
      var Chromecast = chrome.cast.Chromecast;
      var cast       = new Chromecast('12549FA5'); // @todo change to EF46CC40

      self.cast    = cast;
      self.devices = cast.getDeviceList();
      self.states  = Chromecast.constants;

      cast.init();
    }, false);
  }
})();
