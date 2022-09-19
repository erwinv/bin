#!/usr/bin/env /home/erwinv/bin/node_modules/.bin/zx
import 'zx/globals'

const gitdirs = await glob(['**/.git'], {
  onlyDirectories: true,
  followSymbolicLinks: false,
})

for (const gitdir of gitdirs) {
  await within(async () => {
    cd(path.join(gitdir, '..'))

    await $`git fetch`.nothrow()
  })
}
