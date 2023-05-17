#!/usr/bin/env zx
import 'zx/globals'

const glob = globby.globbyStream

const verbose = argv.verbose ?? argv.v ?? false
const serialize = argv.serial ?? argv.s ?? false
const dirArgs = argv._.slice(1)

const globPatterns = dirArgs.length > 0 ? dirArgs.map(dir => `${dir}/**/.git`) : ['**/.git']

const gitdirs = glob(globPatterns, {
  onlyDirectories: true,
  followSymbolicLinks: false,
})

for await (const gitdir of gitdirs) {
  const gitrepo = './' + path.join(gitdir, '..')

  const task = within(async () => {
    $.verbose = verbose

    cd(gitrepo)

    const gitRemotes = await $`git remote`
    if (!gitRemotes.stdout) return ''

    const logs = [chalk.greenBright(gitrepo)]
    for (const gitRemote of gitRemotes.stdout.trimEnd().split(os.EOL)) {
      const gitRemoteUrl = await $`git remote get-url ${gitRemote}`

      logs.push(gitRemote + ' ' + chalk.yellowBright(gitRemoteUrl.stdout.trimEnd()))
    }

    return logs.join(os.EOL) + os.EOL
  })

  if (serialize) {
    const log = await task
    if (log) echo(log)
  } else {
    task.then(log => log && echo(log))
  }
}
