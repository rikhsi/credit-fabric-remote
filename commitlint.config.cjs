module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [2, 'always', ['feat', 'fix', 'chore', 'docs', 'style', 'refactor', 'perf', 'test']],
    'subject-case': [0, 'never', ['start-case', 'pascal-case', 'upper-case']],
  },
};
