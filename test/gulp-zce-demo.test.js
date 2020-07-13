const test = require('ava')
const gulpZceDemo = require('..')

// TODO: Implement module test
test('<test-title>', t => {
  const err = t.throws(() => gulpZceDemo(100), TypeError)
  t.is(err.message, 'Expected a string, got number')

  t.is(gulpZceDemo('w'), 'w@zce.me')
  t.is(gulpZceDemo('w', { host: 'wedn.net' }), 'w@wedn.net')
})
