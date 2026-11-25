import { execFileSync } from 'node:child_process';
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { analyzeCommits as analyzeAllCommits } from '@semantic-release/commit-analyzer';
import { generateNotes as generateAllNotes } from '@semantic-release/release-notes-generator';

// semantic-release reads every commit on the branch. This plugin keeps only the
// commits that changed files of one release unit, so each plugin gets its own
// version and release notes, then writes that version into the plugin manifest.

function changedFiles(hash, cwd) {
  const output = execFileSync(
    'git',
    ['diff-tree', '--no-commit-id', '--name-only', '-r', '--root', hash],
    { cwd, encoding: 'utf8' },
  );

  return output.split('\n').filter(Boolean);
}

function isInside(file, folder) {
  return file.startsWith(`${folder}/`);
}

function belongsToUnit(file, unit) {
  return isInside(file, unit.path) && !unit.exclude.some((folder) => isInside(file, folder));
}

function withUnitCommits({ unit }, context) {
  const commits = context.commits.filter(
    (commit) =>
      !commit.message.startsWith('chore(release):') &&
      changedFiles(commit.hash, context.cwd).some((file) => belongsToUnit(file, unit)),
  );

  return { ...context, commits };
}

export function analyzeCommits(pluginConfig, context) {
  return analyzeAllCommits(pluginConfig, withUnitCommits(pluginConfig, context));
}

export function generateNotes(pluginConfig, context) {
  return generateAllNotes(pluginConfig, withUnitCommits(pluginConfig, context));
}

export async function prepare({ unit }, { cwd, nextRelease, logger }) {
  if (!unit.manifest) {
    return;
  }

  const path = join(cwd, unit.manifest);
  const manifest = JSON.parse(await readFile(path, 'utf8'));

  manifest.version = nextRelease.version;
  await writeFile(path, `${JSON.stringify(manifest, null, 2)}\n`);
  logger.log('Wrote version %s to %s', nextRelease.version, unit.manifest);
}
