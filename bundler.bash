#!/bin/bash
deps=(\
    'node_modules/marked/lib/marked' \
    'mdtex' \
)
bundle='bundle.js'

b=$(pwd)/$bundle

echo '/* mdtex bundle */' > $b && echo "bundling..."
echo 'function mdtex(text) { return parse(text); ' > $b

for d in ${deps[*]}
do  
    cat $(pwd)/$d.js >> $b && echo "->  $d.js"
done

echo '}' > $b   && echo "...done"
