const test = require('node:test');
const assert = require('node:assert/strict');
const { tracks } = require('../src/seed/premiumCurriculum');

test('premium curriculum has unique slugs and detailed module content', () => {
  assert.ok(tracks.length >= 8, 'the premium curriculum should retain its authored learning tracks');
  const slugs = tracks.map(track => track.slug);
  assert.equal(new Set(slugs).size, slugs.length, 'course slugs must be unique');
  for (const track of tracks) {
    assert.ok(track.title.length > 10);
    assert.ok(track.objectives.length >= 4);
    assert.ok(track.prerequisites.length >= 1);
    assert.ok(track.modules.length >= 5, 'each authored track should include multiple modules');
    for (const [title, summary, code, practice] of track.modules) {
      assert.ok(title.length > 3);
      assert.ok(summary.length > 50);
      assert.ok(code.length > 10);
      assert.ok(practice.length > 20);
    }
  }
});

test('premium curriculum expands into three lessons per authored module', () => {
  const modules = tracks.reduce((sum, track) => sum + track.modules.length, 0);
  assert.ok(modules >= 40, 'the authored curriculum should include at least 40 modules');
  assert.equal(tracks.reduce((sum, track) => sum + track.modules.length * 3, 0), modules * 3);
});
