import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const PLUGINS_DIR = 'plugins';

/**
 * A release unit is a folder versioned and tagged on its own: every plugin under
 * plugins/, and the npm package in a plugin's cli/ folder. The plugin unit leaves
 * its cli/ folder out, so a cli change releases the package without bumping the
 * plugin, and the other way around.
 */
export function releaseUnits() {
  return readdirSync(PLUGINS_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .flatMap(({ name }) => {
      const path = join(PLUGINS_DIR, name);
      const cli = join(path, 'cli');
      const manifest = join(path, '.claude-plugin', 'plugin.json');

      if (!existsSync(join(cli, 'package.json'))) {
        return [{ name, path, exclude: [], manifest }];
      }

      return [
        { name, path, exclude: [cli], manifest },
        { name: `${name}-cli`, path: cli, exclude: [], npm: true },
      ];
    });
}

if (import.meta.main) {
  for (const unit of releaseUnits()) {
    console.log(unit.path);
  }
}
