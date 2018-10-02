#!/bin/bash
deps=(\
    'lib/__' \
    'node_modules/marked/lib/marked' \
    'mdtex' \
)
bundle='bundle.js'

echo '/* mdtex bundle */' > $(pwd)/$bundle && echo "bundling..."

for d in ${deps[*]}
do  
    cat $(pwd)/$d.js >> $(pwd)/$bundle && echo "->  $d.js"
done

echo "...done"
