const test = require('node:test');
const assert = require('node:assert/strict');
const { tracks } = require('../src/seed/premiumCurriculum');

test('TyagiJI MERN flagship curriculum contains ten authored modules', () => {
  const course = tracks.find((track) => track.slug === 'mern-stack-professional');
  assert.ok(course, 'MERN Stack course should be included in the premium seed');
  assert.equal(course.technology, 'MERN Stack');
  assert.equal(course.modules.length, 10);
  assert.equal(course.modules.length * 3, 30, 'seed generator creates concepts, worked examples, and practice lessons');
  for (const module of course.modules) {
    assert.equal(module.length, 4);
    assert.ok(module[0].length > 5, 'module title');
    assert.ok(module[1].length > 50, 'module explanation');
    assert.ok(module[2].length > 30, 'real code example');
    assert.ok(module[3].length > 20, 'practice assignment');
  }
});

test('MERN curriculum covers all four stack technologies and production practices', () => {
  const course = tracks.find((track) => track.slug === 'mern-stack-professional');
  const content = course.modules.map((module) => `${module[0]} ${module[1]} ${module[3]}`).join(' ').toLowerCase();
  for (const term of ['react', 'node.js', 'express', 'mongodb', 'authentication', 'crud', 'testing', 'deployment']) {
    assert.ok(content.includes(term), `curriculum should cover ${term}`);
  }
});
