
#!/bin/bash
unzip -o sessao.zip -d . > /dev/null 2>&1
echo "✅ Sessão descompactada com sucesso!"
node app.js
