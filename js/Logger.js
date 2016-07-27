class Logger {
  constructor(panel) {
    //this.panel = $("#logs-panel .card-content");
    this.panel = $(panel);
  }

  log(logObject) {
    var currentDate = new Date();
    var time = ('0' + currentDate.getHours()).slice(-2) + ':' + ('0' + (currentDate.getMinutes())).slice(-2);
    var color = logObject.color || 'black';
    var message = logObject.message || '';
    var shouldToast = logObject.toast || true;
    this.panel.append("<div class='log-item'><span class='log-date'>" + time + "</span><p class='" + color + "-text'>" + message + "</p></div>");
    if (!this.panel.is(":visible") && shouldToast) {
      Materialize.toast(message, 3000);
    }
  }
}
