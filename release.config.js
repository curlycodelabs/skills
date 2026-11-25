import { releaseUnits } from './scripts/release/units.mjs';

// Run once per release unit: RELEASE_UNIT=plugins/<name> npx semantic-release.
// The release workflow loops over `node scripts/release/units.mjs`.
const units = releaseUnits();
const unit = units.find(({ path }) => path === process.env.RELEASE_UNIT);

if (!unit) {
  throw new Error(
    `Set RELEASE_UNIT to one of: ${units.map(({ path }) => path).join(', ')}`,
  );
}

const changelogFile = `${unit.path}/CHANGELOG.md`;

const assets = unit.npm
  ? [`${unit.path}/package.json`, `${unit.path}/package-lock.json`, changelogFile]
  : [unit.manifest, changelogFile];

export default {
  branches: ['main'],
  tagFormat: `${unit.name}-v\${version}`,
  plugins: [
    [
      './scripts/release/unit-plugin.mjs',
      {
        unit,
        preset: 'conventionalcommits',
        // A skill is markdown, so a docs commit can change what the agent does.
        releaseRules: [
          { breaking: true, release: 'major' },
          { type: 'feat', release: 'minor' },
          { type: 'fix', release: 'patch' },
          { type: 'perf', release: 'patch' },
          { type: 'refactor', release: 'patch' },
          { type: 'style', release: 'patch' },
          { type: 'chore', release: 'patch' },
          { type: 'docs', release: 'patch' },
        ],
        // The preset hides every type but feat, fix and perf from the notes.
        presetConfig: {
          types: [
            { type: 'feat', section: 'Features' },
            { type: 'fix', section: 'Bug Fixes' },
            { type: 'perf', section: 'Performance' },
            { type: 'refactor', section: 'Refactoring' },
            { type: 'style', section: 'Style' },
            { type: 'docs', section: 'Documentation' },
            { type: 'chore', section: 'Chores' },
          ],
        },
      },
    ],
    ['@semantic-release/changelog', { changelogFile }],
    ...(unit.npm ? [['@semantic-release/npm', { pkgRoot: unit.path }]] : []),
    [
      '@semantic-release/git',
      {
        assets,
        message: `chore(release): ${unit.name} \${nextRelease.version}\n\n\${nextRelease.notes}`,
      },
    ],
    '@semantic-release/github',
  ],
};
