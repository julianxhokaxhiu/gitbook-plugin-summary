let summary = require( 'gitbook-summary/lib/summary' )

module.exports = {
  hooks: {
    init: function () {
      summary({
        root: this.resolve('')
      })
    }
  }
}
