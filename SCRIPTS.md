```fish
ffmpeg -f alsa -ac 1 -i default -c:a libopus -b:a 128k rec_(date -Iminutes).opus

diff arch.txt (paru -Qneq | psub)
diff aur.txt (paru -Qmeq | psub)

rsync -av /var/cache/pacman/pkg/ arch/ --dry-run
rsync -av ~/.cache/paru/clone/ aur/ --exclude='.git' --dry-run

pushd homebak
for dir in *
    rsync -av ~/$dir/ $dir/ --delete --dry-run
end
popd

git annex sync

git annex add .
git commit

git annex list --in here
git annex get .

git annex drop .
```
