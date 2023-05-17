#!/usr/bin/env zx
import 'zx/globals'

const glob = globby.globbyStream

const verbose = argv.verbose ?? argv.v ?? false
const dirArgs = argv._.slice(1)
const porcelainVersion = argv.porcelain ?? 'v1'

const globPatterns = dirArgs.length > 0 ? dirArgs.map(dir => `${dir}/**/.git`) : ['**/.git']

const gitdirs = glob(globPatterns, {
  onlyDirectories: true,
  followSymbolicLinks: false,
})

async function* tasks() {
  for await (const gitdir of gitdirs) {
    const gitrepo = './' + path.join(gitdir, '..')
  
    const task = within(async () => {
      $.verbose = verbose
  
      cd(gitrepo)
  
      const gitStat = await $`git status --porcelain=${porcelainVersion}`.nothrow()
      if (gitStat.stderr) {
        return chalk.redBright(gitrepo, os.EOL, gitStat.stderr)
      } else if (gitStat.stdout) {
        if (argv.quiet || argv.q) {
          return chalk.yellowBright(gitrepo)
        } else {
          return chalk.greenBright(gitrepo) + os.EOL + chalk.yellowBright(gitStat.stdout)
        }
      }
    })

    yield task
  }
}

for await (const taskLog of tasks()) {
  if (taskLog) {
    echo(taskLog)
  }
}
