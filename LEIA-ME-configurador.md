# Monte seu conector — como instalar

1. Copie para a RAIZ do repositório do site (mesmo nível do index.html):
   - monte-seu-conector.html
   - pasta configurador/  (catalogo.js, configurador.js, configurador.css)
   - pasta img/pn/        (fotos por PN — veja img/pn/LEIA-ME.md)
2. Em configurador/catalogo.js, troque `emailDestino` pelo e-mail que vai receber os pedidos.
   Na primeira solicitação, o FormSubmit manda um e-mail de ativação para esse endereço: clique para ativar.
   (Opcional) Preencha `whatsapp` para mostrar o botão "Enviar pelo WhatsApp".
3. No index.html, adicione o link no menu:  <a href="monte-seu-conector.html">Monte seu conector</a>
4. Para adicionar ou corrigir produtos, edite só o catalogo.js.
