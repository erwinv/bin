#!/usr/bin/env zx
import 'zx/globals'

const glob = globby.globbyStream

const verbose = argv.verbose ?? argv.v ?? false
const dirArgs = argv._.slice(1)

const globPatterns = dirArgs.length > 0 ? dirArgs.map(dir => `${dir}/**/.git`) : ['**/.git']

const gitdirs = glob(globPatterns, {
  onlyDirectories: true,
  followSymbolicLinks: false,
})

for await (const gitdir of gitdirs) {
  const gitRepo = './' + path.join(gitdir, '..')

  within(async () => {
    $.verbose = verbose

    cd(gitRepo)

    const gitStat = await $`git status --porcelain`.nothrow()
    if (gitStat.stderr) {
      echo(chalk.redBright(gitRepo, os.EOL, gitStat.stderr))
    } else if (gitStat.stdout) {
      if (argv.quiet || argv.q) {
        echo(chalk.yellowBright(gitRepo))
      } else {
        echo(chalk.greenBright(gitRepo) + os.EOL + chalk.yellowBright(gitStat.stdout))
      }
    }
  })
}
