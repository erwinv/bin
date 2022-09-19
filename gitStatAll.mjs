#!/usr/bin/env /home/erwinv/bin/node_modules/.bin/zx
import 'zx/globals'

const gitdirs = await glob(['**/.git'], {
  onlyDirectories: true,
  followSymbolicLinks: false,
})

for (const gitdir of gitdirs) {
  await within(async () => {
    cd(path.join(gitdir, '..'))

    const gitStat = await $`git status`.quiet()
    const upToDate = gitStat.stdout.includes('Your branch is up to date')
    const clean = gitStat.stdout.includes('working tree clean')
    if (!upToDate || !clean) echo(gitStat.stdout)
  })
}
