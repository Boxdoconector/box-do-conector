# Box do Conector — landing page

Página institucional estática feita com HTML, CSS e JavaScript, sem instalação de pacotes ou etapa de build. A pasta pode ser publicada diretamente no GitHub Pages.

## Configure os canais oficiais

Os links enviados já estão configurados em `config.js`:

- `mercadoLivre`: URL oficial da loja/perfil da Box do Conector no Mercado Livre.
- `whatsapp`: link `https://wa.me/55...` com DDI, DDD e número, sem espaços ou símbolos.

Os CTAs de compra apontam para o perfil informado no Mercado Livre e os de atendimento para o número informado no WhatsApp. O domínio configurado para o GitHub Pages é `www.boxdoconector.com.br`.

## Publicar no GitHub Pages

1. Entre no GitHub e crie um repositório público chamado `box-do-conector`.
2. No repositório, clique em **Add file → Upload files**.
3. Envie `index.html`, `styles.css`, `script.js`, `config.js`, `CNAME`, `logo-box-do-conector.png`, `mercado-livre.avif`, `whatsapp.webp`, `whatsapp-blueprint.png`, `card-conectores.png`, `card-terminais.png`, `card-emendas.png`, `card-acessorios.png` e `README.md`.
4. Clique em **Commit changes** para salvar os arquivos.
5. Abra **Settings → Pages**.
6. Em **Build and deployment**, escolha **Deploy from a branch**.
7. Selecione a branch `main` e a pasta `/(root)`, depois clique em **Save**.
8. Aguarde a publicação. O endereço do site aparecerá na mesma página de configurações.
9. Em **Settings → Pages → Custom domain**, informe `www.boxdoconector.com.br` e salve. No painel do provedor onde o domínio foi registrado, crie um registro DNS do tipo **CNAME** para `www` apontando para `SEU-USUARIO.github.io` (substitua pelo seu usuário do GitHub). Depois que o DNS propagar, volte a **Settings → Pages** e ative **Enforce HTTPS** quando a opção aparecer.

As fotos originais de fundo dos quatro cards são `card-conectores.png`, `card-terminais.png`, `card-emendas.png` e `card-acessorios.png`. Elas se misturam ao fundo branco dos cards por composição CSS. O desenho técnico `whatsapp-blueprint.png` aparece de forma sutil no fundo do painel de atendimento por WhatsApp. Para trocar a logo da Box, substitua `logo-box-do-conector.png` por outra imagem com o mesmo nome. As imagens `mercado-livre.avif` e `whatsapp.webp` são os símbolos exibidos nos botões. A página não tem catálogo, carrinho, checkout ou formulário: a compra acontece pelo Mercado Livre e o atendimento pelo WhatsApp.
