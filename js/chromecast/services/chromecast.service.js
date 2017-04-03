(function() {
  angular
    .module('jwShowcase.chromecast')
    .service('chromecast', chromecast);

  chromecast.$inject = [];

  function chromecast() {
    var Chromecast = chrome.cast.Chromecast;
    var cast       = new Chromecast('12549FA5');
    var self       = this;

    this.cast    = cast;
    this.devices = cast.getDeviceList();
    this.states  = Chromecast.constants;

    cast.init();
  }
})();
