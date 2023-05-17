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
  const gitrepo = path.join(gitdir, '..')

  const task = within(async () => {
    $.verbose = verbose

    cd(gitrepo)

    const gitRemotes = await $`git remote -v | grep '(fetch)' | cut -f2`.nothrow()
    if (!gitRemotes.stdout) return
    const hasHttpsRemote = gitRemotes.stdout.trimEnd().split(os.EOL).some(remote => remote.startsWith('https:'))
    if (hasHttpsRemote) return

    const fetchLog = `Fetching ${chalk.greenBright(gitrepo)}`
    if (!serialize) {
      echo(fetchLog)
    }

    const gitFetchPromise = $`git fetch`.nothrow()
    const gitFetch = await (serialize ? spinner(fetchLog, () => gitFetchPromise) : gitFetchPromise)
    if (gitFetch.stderr) {
      echo(chalk.yellowBright(gitrepo), os.EOL, chalk.redBright(gitFetch.stderr))
    }
  })

  if (serialize) {
    await task
  }
}
