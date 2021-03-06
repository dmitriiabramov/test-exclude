/* global describe, it */

const exclude = require('../')

require('chai').should()

describe('testExclude', function () {
  it('should always exclude node_modules folder', function () {
    exclude().shouldInstrument('./banana/node_modules/cat.js').should.equal(false)
  })

  it('ignores ./', function () {
    exclude().shouldInstrument('./test.js').should.equal(false)
  })

  it('does not instrument files outside cwd', function () {
    exclude().shouldInstrument('../foo.js').should.equal(false)
  })

  it('applies exclude rule ahead of include rule', function () {
    const e = exclude({
      include: ['test.js', 'foo.js'],
      exclude: ['test.js']
    })
    e.shouldInstrument('test.js').should.equal(false)
    e.shouldInstrument('foo.js').should.equal(true)
    e.shouldInstrument('banana.js').should.equal(false)
  })

  it('should handle gitignore-style excludes', function () {
    const e = exclude({
      exclude: ['dist']
    })

    e.shouldInstrument('dist/foo.js').should.equal(false)
    e.shouldInstrument('dist/foo/bar.js').should.equal(false)
    e.shouldInstrument('src/foo.js').should.equal(true)
  })

  it('should handle gitignore-style includes', function () {
    const e = exclude({
      include: ['src']
    })

    e.shouldInstrument('src/foo.test.js').should.equal(false)
    e.shouldInstrument('src/foo.js').should.equal(true)
    e.shouldInstrument('src/foo/bar.js').should.equal(true)
  })

  it('does not exclude anything if an empty array passed', function () {
    const e = exclude({
      exclude: []
    })

    e.shouldInstrument('__tests__/a-test.js').should.equal(true)
    e.shouldInstrument('src/a.test.js').should.equal(true)
    e.shouldInstrument('src/foo.js').should.equal(true)
  })

  describe('pkgConf', function () {
    it('should load exclude rules from config key', function () {
      const e = exclude({
        configPath: './test/fixtures/exclude',
        configKey: 'a'
      })

      e.shouldInstrument('foo.js').should.equal(true)
      e.shouldInstrument('batman.js').should.equal(false)
      e.configFound.should.equal(true)
    })

    it('should load include rules from config key', function () {
      const e = exclude({
        configPath: './test/fixtures/include',
        configKey: 'b'
      })

      e.shouldInstrument('foo.js').should.equal(false)
      e.shouldInstrument('batman.js').should.equal(true)
      e.configFound.should.equal(true)
    })

    it('should only instrument files that are included in subdirs', function () {
      const e = exclude({
        configPath: './test/fixtures/include-src-only',
        configKey: 'c'
      })
      e.shouldInstrument('bar/baz.js').should.equal(false)
      e.shouldInstrument('bad/file.js').should.equal(false)
      e.shouldInstrument('foo.js').should.equal(false)

      e.shouldInstrument('src/app.test.js').should.equal(false)
      e.shouldInstrument('src/app.js').should.equal(true)
    })

    it('should not throw if a key is missing', function () {
      var e = exclude({
        configPath: './test/fixtures/include',
        configKey: 'c'
      })
      e.configFound.should.equal(false)
    })
  })
})
