#!/usr/bin/env zx
import 'zx/globals'

const glob = globby.globbyStream

const verbose = argv.verbose ?? argv.v ?? false
const parallelize = argv.parallel ?? argv.p ?? false
const dirArgs = argv._.slice(1)

const globPatterns = dirArgs.length > 0 ? dirArgs.map(dir => `${dir}/**/.git`) : ['**/.git']

const gitdirs = glob(globPatterns, {
  onlyDirectories: true,
  followSymbolicLinks: false,
})

for await (const gitdir of gitdirs) {
  const gitRepo = path.join(gitdir, '..')
  
  const fetchTask = within(async () => {
    $.verbose = verbose

    cd(gitRepo)

    const gitRemotes = await $`git remote -v | grep fetch | cut -f2`.nothrow()
    if (!gitRemotes.stdout) return
    const hasHttpsRemote = gitRemotes.stdout.trimEnd().split(os.EOL).some(remote => remote.startsWith('https:'))
    if (hasHttpsRemote) return

    let gitFetchPromise = $`git fetch`.nothrow()
    const fetchLog = `Fetching ${gitRepo}`
    if (parallelize) {
      echo(fetchLog)
    } else {
      gitFetchPromise = spinner(fetchLog, () => gitFetchPromise)
    }
    const gitFetch = await gitFetchPromise
    if (gitFetch.stderr) {
      echo(chalk.redBright(gitRepo, os.EOL, gitFetch.stderr))
    }
  })

  if (!parallelize) {
    await fetchTask
  }
}
