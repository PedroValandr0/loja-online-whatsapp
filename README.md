# 🎮 GameTech - Sistema de Banco de Dados de Produtos

## 📋 Como Funciona o Sistema

Seu site GameTech agora possui um **sistema completo de banco de dados com controle de estoque**! Aqui está como usar:

---

## 🔐 **SEGURANÇA - Acessar o Painel Administrativo**

### **Tela de Login**
Quando você acessa o painel administrativo, aparece uma tela de login solicitando uma **senha**. Isso protege seus dados!

### **Senha Padrão (ALTERE ASSIM QUE POSSÍVEL)**
```
Senha: admin123
```

⚠️ **IMPORTANTE**: Altere a senha padrão para uma senha forte!

### **Como Alterar a Senha**
1. Abra o arquivo **admin.html** em um editor de código (Notepad++, VSCode, etc)
2. Procure pela linha: `const SENHA_ADMIN = "admin123";`
3. Troque `admin123` pela sua nova senha desejada
4. **Salve o arquivo**

Exemplo:
```javascript
// Trocar de:
const SENHA_ADMIN = "admin123";

// Para:
const SENHA_ADMIN = "minha_senha_super_secreta_2024";
```

### **Como Fazer Login**
1. Abra: **admin.html**
2. Digite a senha do admin
3. Clique em **"🔐 Acessar Painel"**
4. Pronto! Você está autenticado e pode editar produtos

### **Como Fazer Logout**
1. Clique no botão **"🚪 Sair (Logout)"** no topo da página
2. Você será desconectado do painel
3. Terá que digitar a senha novamente para acessar

---

## 📦 **Gerenciar Produtos**

### **Ver Produtos**
- Todos os produtos são exibidos em uma tabela com:
  - Nome do produto
  - Preço (em R$)
  - Quantidade em estoque
  - Status (Em Estoque / Baixo Estoque / Sem Estoque)
  - Botões de ação

### **Editar Produto**
1. Clique no botão **"✏️ Editar"** próximo ao produto
2. Modifique os dados:
   - Nome
   - Descrição
   - Preço
   - **Quantidade** (isso controla o estoque!)
   - Categoria
   - URL da Imagem
3. Clique em **"Salvar"**

### **Adicionar Novo Produto**
1. Clique em **"➕ Novo Produto"** no topo da página
2. Preencha todos os dados:
   - **Nome** (obrigatório)
   - Descrição
   - **Preço** (obrigatório)
   - **Quantidade** (obrigatório)
   - Categoria
   - URL da Imagem
3. Clique em **"Salvar"**

### **Deletar Produto**
1. Clique em **"🗑️ Deletar"** próximo ao produto
2. Confirme a exclusão

---

## 💾 **Salvar e Fazer Backup**

### **Como as Mudanças São Salvas**
- ✅ Todas as alterações são salvas automaticamente no **localStorage** do navegador
- ✅ Os dados persistem mesmo se você fechar a página e voltar depois
- ⚠️ Se você limpar o histórico/cache do navegador, os dados podem ser perdidos

### **Fazer Download do Banco de Dados**
1. Clique em **"⬇️ Download JSON"**
2. Um arquivo `produtos-gametech-YYYY-MM-DD.json` será baixado
3. **Guarde este arquivo em um local seguro** como backup

### **Restaurar do Backup**
1. Clique em **"⬆️ Upload JSON"**
2. Selecione um arquivo `produtos-gametech-*.json` que você salvou
3. Os produtos serão importados automaticamente

---

## 🛒 **Como Funciona a Compra e Estoque**

### **Na Loja (index.html)**
1. Produtos aparecem com **status de disponibilidade**:
   - ✅ **Em Estoque** - Botão ativo, cliente pode comprar
   - ⚠️ **Baixo Estoque** - Aviso visual (≤5 unidades)
   - ❌ **Sem Estoque** - Botão desabilitado, não pode comprar

2. Quando o cliente **clica em "Adicionar ao Carrinho"**:
   - O produto é adicionado ao carrinho

3. Quando o cliente **finaliza a compra via WhatsApp**:
   - A quantidade do produto é **automaticamente decrementada**
   - Se havia 5 unidades e o cliente comprou 2, fica com 3
   - Quando chega a zero, o botão fica desabilitado (Indisponível)

---

## 📊 **Exemplos de Uso**

### **Cenário 1: Você tem 10 Mouses em estoque**
```
Admin edita: Quantidade = 10
Site mostra: ✅ 10 em estoque
Cliente pode: Comprar quantos quiser (até 10)
Compra 3: Quantidade fica com 7
Site atualiza: ✅ 7 em estoque
```

### **Cenário 2: Produto Acabou**
```
Admin edita: Quantidade = 0
Site mostra: ❌ Indisponível
Cliente: Não consegue adicionar ao carrinho
```

### **Cenário 3: Baixo Estoque**
```
Admin edita: Quantidade = 3
Site mostra: ⚠️ Baixo Estoque (3 em estoque)
Cliente pode: Comprar (mas a cor fica diferente, aviso visual)
```

---

## ⚙️ **Funcionalidades do Painel Admin**

| Botão | Função |
|-------|--------|
| ➕ Novo Produto | Adiciona um novo produto ao banco |
| ⬇️ Download JSON | Faz backup do banco de dados |
| ⬆️ Upload JSON | Restaura produtos de um backup |
| 🔍 Buscar | Procura produtos por nome ou categoria |
| ✏️ Editar | Modifica um produto existente |
| 🗑️ Deletar | Remove um produto (com confirmação) |
| 🚪 Logout | Faz logout do painel |
| 🏷️ Promoção | Aplica desconto em produtos |

---

## 🔍 **Buscar Produtos**

1. Na página de admin, use a barra de **"Buscar produto..."**
2. Digite o **nome** ou **categoria** do produto
3. A tabela filtra em tempo real

---

## 📱 **Compatibilidade**

✅ **Desktop** - Funciona perfeitamente
✅ **Mobile** - Interface adaptada para telas pequenas
✅ **Tablets** - Layout responsivo

---

## ⚠️ **Importante - Dicas e Cuidados**

### **✔️ Faça Regularmente:**
- Mantenha backups do seu banco de dados (clique em "⬇️ Download JSON")
- Revise o estoque regularmente
- Atualize preços quando necessário
- Altere a senha do admin periodicamente

### **❌ Evite:**
- Limpar cache/histórico do navegador (pode perder dados)
- Usar o browser em modo anônimo (dados não são salvos)
- Deletar produtos sem ter certeza
- Deixar a senha padrão (admin123) - ALTERE ASSIM QUE POSSÍVEL!
- Compartilhar a senha com pessoas não autorizadas

### **🆘 Se Algo Der Errado:**
1. Se perdeu os dados, pode restaurar do último backup (Upload JSON)
2. Se a página está lenta, recarregue (F5 ou Ctrl+R)
3. Se o arquivo JSON for inválido, o sistema avisará automaticamente
4. Se esqueceu a senha, você terá que editar admin.html novamente

---

## 📝 **Estrutura do Banco de Dados (JSON)**

Cada produto tem:
```json
{
  "id": 1,
  "nome": "RTX 4070 Ti",
  "descricao": "Descrição do produto...",
  "preco": 4999.00,
  "imagem": "https://...",
  "imagens": ["https://...", "https://..."],
  "categoria": "Placas de Vídeo",
  "quantidade": 5
}
```

---

## 🔐 **Sobre Segurança**

### **Como Funciona a Proteção**
- ✅ Usa **sessionStorage** para manter sua sessão só neste navegador/aba
- ✅ Ao fechar o navegador ou a aba, precisa fazer login novamente
- ✅ Apenas quem souber a senha consegue editar o banco

### **Limitações (Site = Sem Backend)**
- ⚠️ A senha é armazenada no código (formato local)
- ⚠️ Não é recomendado para sites de altíssima segurança
- ⚠️ Se alguém acessar seu código, verá a senha

### **Recomendações**
- 📌 Use em ambientes locais ou internos
- 📌 Altere a senha regularmente
- 📌 Use uma senha forte (números, letras, símbolos)
- 📌 Não compartilhe com desconhecidos

---

## 🚀 **Próximas Melhorias (Opcional)**

Possibilidades futuras que você pode pedir:
- 📊 Relatórios de estoque
- 🔔 Notificações de baixo estoque
- 💾 Backup automático na nuvem
- 👥 Múltiplos usuários com permissões diferentes

---

## 📞 **Suporte**

Se tiver dúvidas sobre como usar o sistema, entre em contato!

**Seu site GameTech está pronto e protegido! 🎮🔐**
