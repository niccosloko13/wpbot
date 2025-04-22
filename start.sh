#!/bin/bash
unzip -o sessao.zip -d . > /dev/null
echo "✅ Sessão descompactada com sucesso!"
node app.js
