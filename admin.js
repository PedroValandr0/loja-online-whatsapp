let produtos = [];
let produtoEmEdicao = null;
let uploadedImageDataURL = null;
let uploadedImagesDataURLs = []; // Para múltiplas imagens
let historicoVendas = [];
let historicoAlteracoes = [];
const SENHA_ADMIN = "teste"; // ⚠️ ALTERE ISSO!

// ========== AUTENTICAÇÃO =========
function verificarAutenticacao() {
    const sessaoValida = sessionStorage.getItem('adminAutenticado');
    if (sessaoValida === 'true') {
        mostrarAdmin();
    } else {
        mostrarLogin();
    }
}

function fazerLogin(event) {
    event.preventDefault();
    const senha = document.getElementById('senhaInput').value;
    
    if (senha === SENHA_ADMIN) {
        sessionStorage.setItem('adminAutenticado', 'true');
        mostrarAdmin();
    } else {
        const erroDiv = document.getElementById('loginErro');
        erroDiv.textContent = '❌ Senha incorreta!';
        erroDiv.classList.add('show');
        document.getElementById('senhaInput').value = '';
        console.log('Tentativa de login com senha errada');
    }
}

function fazerLogout() {
    sessionStorage.removeItem('adminAutenticado');
    document.getElementById('senhaInput').value = '';
    document.getElementById('loginErro').classList.remove('show');
    window.location.href = 'index.html';
}

function mostrarLogin() {
    document.getElementById('login-container').classList.remove('hidden');
    document.getElementById('admin-container').classList.remove('visible');
}

function mostrarAdmin() {
    document.getElementById('login-container').classList.add('hidden');
    document.getElementById('admin-container').classList.add('visible');
    inicializar();
}

function configurarUploadImagem() {
    const dropZone = document.getElementById('imagemDropZone');
    const fileInput = document.getElementById('produtoImagemUpload');

    if (!dropZone || !fileInput) return;

    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('dragover');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        const file = e.dataTransfer.files[0];
        if (file) {
            processarArquivoImagem(file);
        }
    });

    fileInput.addEventListener('change', processarUploadImagem);
}

function processarUploadImagem(event) {
    const file = event.target.files[0];
    if (file) {
        processarArquivoImagem(file);
    }
}

function processarArquivoImagem(file) {
    if (!file.type.startsWith('image/')) {
        alert('⚠️ Por favor, selecione um arquivo de imagem válido.');
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        uploadedImagesDataURLs.push(e.target.result);

        // Adiciona campo automaticamente para imagem upload
        const container = document.getElementById('produtoImagensContainer');
        if (container) {
            const itens = container.querySelectorAll('.imagem-item');
            const novoIndex = itens.length;
            const novoItem = document.createElement('div');
            novoItem.className = 'imagem-item';
            novoItem.setAttribute('data-index', novoIndex);
            novoItem.innerHTML = `
                <input type="text" class="produto-imagem-url" value="${e.target.result}" placeholder="URL da imagem ${novoIndex + 1}" oninput="atualizarPreviewPorURLMultiplo(${novoIndex})">
                <button type="button" onclick="removerImagem(${novoIndex})" class="btn-remover-imagem">❌</button>
                <img class="preview-imagem-multiplo" src="${e.target.result}" alt="Preview ${novoIndex + 1}" style="display: block">
            `;
            container.appendChild(novoItem);
        }
    };
    reader.readAsDataURL(file);
}

// Funções legacy mantidas para compatibilidade
function atualizarPreviewPorURL() { return; }
function setPreviewImagem() { /* compatibilidade — usa múltiplas imagens */ }

// ========== FUNCIONALIDADES DO ADMIN ==========
function inicializar() {
    const produtosSalvos = localStorage.getItem('produtosGameTech');
    const vendasSalvas = localStorage.getItem('historicoVendas');
    const alteracoesSalvas = localStorage.getItem('historicoAlteracoes');

    if (produtosSalvos) {
        try {
            produtos = JSON.parse(produtosSalvos);
            console.log('✓ Produtos carregados do localStorage');
        } catch (e) {
            console.error('Erro ao carregar produtos:', e);
            carregarProdutosPadrao();
        }
    } else {
        carregarProdutosPadrao();
    }

    if (vendasSalvas) {
        try {
            historicoVendas = JSON.parse(vendasSalvas);
        } catch {
            historicoVendas = [];
        }
    }

    if (alteracoesSalvas) {
        try {
            historicoAlteracoes = JSON.parse(alteracoesSalvas);
        } catch {
            historicoAlteracoes = [];
        }
    }

    renderizarTabela();
    renderizarHistoricos();
}

function carregarProdutosPadrao() {
    fetch('produtos.json')
        .then(response => response.json())
        .then(data => {
            produtos = data.produtos;
            localStorage.setItem('produtosGameTech', JSON.stringify(produtos));
            // preserva historicos existentes
            if (!localStorage.getItem('historicoVendas')) {
                localStorage.setItem('historicoVendas', JSON.stringify(historicoVendas));
            }
            if (!localStorage.getItem('historicoAlteracoes')) {
                localStorage.setItem('historicoAlteracoes', JSON.stringify(historicoAlteracoes));
            }
            renderizarTabela();
            mostrarMensagem('✓ Produtos carregados com sucesso!');
        })
        .catch(error => {
            console.error('Erro ao carregar JSON:', error);
            mostrarMensagem('⚠️ Não foi possível carregar o arquivo produtos.json');
        });
}

function renderizarTabela() {
    const tbody = document.getElementById('produtosTabela');
    
    if (produtos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: #999;">Nenhum produto cadastrado</td></tr>';
        return;
    }

    tbody.innerHTML = produtos.map((produto, index) => `
        <tr>
            <td class="produto-nome">${produto.nome}</td>
            <td>
                <input type="number" step="0.01" min="0" value="${produto.preco.toFixed(2)}" onchange="atualizarProdutoInline(${index}, 'preco', this.value)" onkeydown="if(event.key === 'Enter'){this.blur();}">
            </td>
            <td>
                <input type="number" min="0" value="${produto.quantidade}" onchange="atualizarProdutoInline(${index}, 'quantidade', this.value)" onkeydown="if(event.key === 'Enter'){this.blur();}">
            </td>
            <td>
                <span class="quantidade-status ${obterStatusEstoque(produto.quantidade)}">
                    ${obterTextStatusEstoque(produto.quantidade)}
                </span>
            </td>
            <td class="acoes">
                <button class="btn-pequeno" onclick="editarProduto(${index})">✏️ Editar</button>
                <button class="btn-pequeno btn-danger" onclick="deletarProduto(${index})">🗑️ Deletar</button>
                <button class="btn-pequeno btn-warning" onclick="abrirModalPromocao(${index})">🏷️ Promoção</button>
            </td>
        </tr>
    `).join('');

    renderizarHistoricos();
}

function renderizarHistoricos() {
    const listaVendas = document.getElementById('historicoVendas');
    const listaAlteracoes = document.getElementById('historicoAlteracoes');

    if (!listaVendas || !listaAlteracoes) return;

    if (historicoVendas.length === 0) {
        listaVendas.innerHTML = '<li>Nenhuma venda registrada</li>';
    } else {
        listaVendas.innerHTML = historicoVendas.slice(0, 10).map(item =>
            `<li>${item.data} — ${item.nome} x${item.quantidade} (R$ ${item.total.toFixed(2)})</li>`
        ).join('');
    }

    if (historicoAlteracoes.length === 0) {
        listaAlteracoes.innerHTML = '<li>Nenhuma alteração registrada</li>';
    } else {
        listaAlteracoes.innerHTML = historicoAlteracoes.slice(0, 15).map(item =>
            `<li>${item.data} — ${item.produto}: ${item.campo} de ${item.valorAnterior} → ${item.valorAtual}</li>`
        ).join('');
    }
}

function obterStatusEstoque(quantidade) {
    if (quantidade === 0) return 'sem-estoque';
    if (quantidade <= 5) return 'baixo-estoque';
    return 'em-estoque';
}

function obterTextStatusEstoque(quantidade) {
    if (quantidade === 0) return '❌ Sem Estoque';
    if (quantidade <= 5) return '⚠️ Baixo Estoque';
    return '✅ Em Estoque';
}

function atualizarProdutoInline(index, campo, valor) {
    const produto = produtos[index];
    if (!produto) return;

    let valorAnterior;
    let valorAtual;

    if (campo === 'preco') {
        const preco = parseFloat(valor);
        if (isNaN(preco) || preco < 0) return;
        valorAnterior = produto.preco;
        valorAtual = preco;
        produto.preco = preco;
    }

    if (campo === 'quantidade') {
        const quantidade = parseInt(valor, 10);
        if (isNaN(quantidade) || quantidade < 0) return;
        valorAnterior = produto.quantidade;
        valorAtual = quantidade;
        produto.quantidade = quantidade;
    }

    if (valorAnterior !== undefined && valorAtual !== undefined && valorAnterior !== valorAtual) {
        historicoAlteracoes.unshift({
            data: new Date().toLocaleString(),
            produto: produto.nome,
            campo,
            valorAnterior,
            valorAtual
        });
    }

    salvarProdutos();
    renderizarTabela();
    mostrarMensagem('✓ Alteração salva automaticamente');
}

function venderProduto(index) {
    const produto = produtos[index];
    if (!produto) return;

    if (produto.quantidade <= 0) {
        alert('Este produto está sem estoque.');
        return;
    }

    const quantidadeAnterior = produto.quantidade;
    produto.quantidade -= 1;

    const venda = {
        data: new Date().toLocaleString(),
        nome: produto.nome,
        quantidade: 1,
        precoUnitario: produto.preco,
        total: produto.preco
    };

    historicoVendas.unshift(venda);
    historicoAlteracoes.unshift({
        data: venda.data,
        produto: produto.nome,
        campo: 'quantidade',
        valorAnterior: quantidadeAnterior,
        valorAtual: produto.quantidade
    });

    salvarProdutos();
    renderizarTabela();
    mostrarMensagem('✓ Venda registrada e estoque atualizado');
}

// ========== ORDENAÇÃO DE PRODUTOS ==========
let ordenacaoAtual = null;

function ordenarPor(criterio) {
    // Toggle direção se já está ordenando pelo mesmo critério
    if (ordenacaoAtual === criterio) {
        produtos.reverse();
    } else {
        ordenacaoAtual = criterio;

        if (criterio === 'nome') {
            produtos.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
        } else if (criterio === 'preco') {
            produtos.sort((a, b) => a.preco - b.preco);
        } else if (criterio === 'quantidade') {
            produtos.sort((a, b) => b.quantidade - a.quantidade);
        }
    }

    renderizarTabela();
    destacarBotaoOrdenacao(criterio);
}

function destacarBotaoOrdenacao(criterio) {
    document.querySelectorAll('.btn-ordenacao').forEach(btn => btn.classList.remove('ativo'));
    const mapa = { nome: 'btnOrdenarNome', preco: 'btnOrdenarPreco', quantidade: 'btnOrdenarQuantidade' };
    const btn = document.getElementById(mapa[criterio]);
    if (btn) btn.classList.add('ativo');
}

function filtrarProdutos() {
    const termo = document.getElementById('searchInput').value.toLowerCase();
    const tbody = document.getElementById('produtosTabela');
    
    const produtosFiltrados = produtos.filter(p => 
        p.nome.toLowerCase().includes(termo) || 
        p.categoria.toLowerCase().includes(termo)
    );

    if (produtosFiltrados.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: #999;">Nenhum produto encontrado</td></tr>';
        return;
    }

    tbody.innerHTML = produtosFiltrados.map((produto, index) => {
        const indiceReal = produtos.indexOf(produto);
        return `
            <tr>
                <td class="produto-nome">${produto.nome}</td>
                <td>
                    <input type="number" step="0.01" min="0" value="${produto.preco.toFixed(2)}" onchange="atualizarProdutoInline(${indiceReal}, 'preco', this.value)" onkeydown="if(event.key === 'Enter'){this.blur();}">
                </td>
                <td>
                    <input type="number" min="0" value="${produto.quantidade}" onchange="atualizarProdutoInline(${indiceReal}, 'quantidade', this.value)" onkeydown="if(event.key === 'Enter'){this.blur();}">
                </td>
                <td>
                    <span class="quantidade-status ${obterStatusEstoque(produto.quantidade)}">
                        ${obterTextStatusEstoque(produto.quantidade)}
                    </span>
                </td>
                <td class="acoes">
                    <button class="btn-pequeno" onclick="editarProduto(${indiceReal})">✏️ Editar</button>
                    <button class="btn-pequeno btn-danger" onclick="deletarProduto(${indiceReal})">🗑️ Deletar</button>
                </td>
            </tr>
        `;
    }).join('');
}

function abrirModalNovoProduto() {
    produtoEmEdicao = null;
    uploadedImageDataURL = null;
    uploadedImagesDataURLs = [];
    document.getElementById('modalTitulo').textContent = 'Novo Produto';
    document.getElementById('formProduto').reset();
    document.getElementById('produtoImagemUpload').value = '';
    
    // Inicializar com uma imagem vazia
    document.getElementById('produtoImagensContainer').innerHTML = `
        <div class="imagem-item" data-index="0">
            <input type="text" class="produto-imagem-url" value="" placeholder="URL da imagem 1" oninput="atualizarPreviewPorURLMultiplo(0)">
            <button type="button" onclick="removerImagem(0)" class="btn-remover-imagem">❌</button>
            <img class="preview-imagem-multiplo" src="" alt="Preview 1" style="display: none">
        </div>
    `;
    
    document.getElementById('modalProduto').classList.add('ativo');
}

function editarProduto(index) {
    produtoEmEdicao = index;
    const produto = produtos[index];
    
    uploadedImageDataURL = null;
    uploadedImagesDataURLs = [];
    document.getElementById('modalTitulo').textContent = 'Editar Produto';
    document.getElementById('produtoNome').value = produto.nome;
    document.getElementById('produtoDescricao').value = produto.descricao;
    document.getElementById('produtoPreco').value = produto.preco;
    document.getElementById('produtoQuantidade').value = produto.quantidade;
    document.getElementById('produtoCategoria').value = produto.categoria;
    
    // Suporte para múltiplas imagens
    const imagens = Array.isArray(produto.imagens) && produto.imagens.length > 0 ? produto.imagens : [produto.imagem || ''];
    document.getElementById('produtoImagensContainer').innerHTML = imagens.map((img, idx) => 
        `<div class="imagem-item" data-index="${idx}">
            <input type="text" class="produto-imagem-url" value="${img}" placeholder="URL da imagem ${idx + 1}" oninput="atualizarPreviewPorURLMultiplo(${idx})">
            <button type="button" onclick="removerImagem(${idx})" class="btn-remover-imagem">❌</button>
            <img class="preview-imagem-multiplo" src="${img || ''}" alt="Preview ${idx + 1}" style="display: ${img ? 'block' : 'none'}">
        </div>`
    ).join('');
    
    document.getElementById('produtoImagemUpload').value = '';
    document.getElementById('modalProduto').classList.add('ativo');
}

async function salvarProduto(event) {
    event.preventDefault();
    
    // Coletar URLs das imagens
    const imagemInputs = document.querySelectorAll('.produto-imagem-url');
    const imagens = Array.from(imagemInputs).map(input => input.value.trim()).filter(url => url !== '');
    
    // Adicionar imagens uploaded se houver
    if (uploadedImagesDataURLs.length > 0) {
        imagens.push(...uploadedImagesDataURLs);
    }
    
    // Usar placeholder se não houver imagens
    if (imagens.length === 0) {
        imagens.push('https://via.placeholder.com/400x300');
    }

    const produto = {
        nome: document.getElementById('produtoNome').value,
        descricao: document.getElementById('produtoDescricao').value,
        preco: parseFloat(document.getElementById('produtoPreco').value),
        quantidade: parseInt(document.getElementById('produtoQuantidade').value),
        categoria: document.getElementById('produtoCategoria').value,
        imagens: imagens,
        imagem: imagens[0] // Manter compatibilidade com código antigo
    };

    if (produtoEmEdicao !== null) {
        produtos[produtoEmEdicao].id = produtos[produtoEmEdicao].id;
        Object.assign(produtos[produtoEmEdicao], produto);
        mostrarMensagem('✓ Produto atualizado com sucesso!');
    } else {
        produto.id = produtos.length > 0 ? Math.max(...produtos.map(p => p.id || 0)) + 1 : 1;
        produtos.push(produto);
        mostrarMensagem('✓ Novo produto adicionado com sucesso!');
    }

    uploadedImageDataURL = null;
    uploadedImagesDataURLs = [];
    salvarProdutos();
    renderizarTabela();
    fecharModal();
}

function deletarProduto(index) {
    if (confirm(`Tem certeza que deseja deletar "${produtos[index].nome}"?`)) {
        produtos.splice(index, 1);
        salvarProdutos();
        renderizarTabela();
        mostrarMensagem('✓ Produto deletado com sucesso!');
    }
}

function fecharModal() {
    document.getElementById('modalProduto').classList.remove('ativo');
}

function salvarProdutos() {
    localStorage.setItem('produtosGameTech', JSON.stringify(produtos));
    localStorage.setItem('historicoVendas', JSON.stringify(historicoVendas));
    localStorage.setItem('historicoAlteracoes', JSON.stringify(historicoAlteracoes));
    console.log('✓ Produtos e históricos salvos no localStorage');
}

function limparHistoricoVendas() {
    if (!confirm('Tem certeza que deseja limpar o histórico de vendas?')) return;

    historicoVendas = [];
    salvarProdutos();
    renderizarHistoricos();
    mostrarMensagem('✓ Histórico de vendas limpo com sucesso');
}

function limparHistoricoAlteracoes() {
    if (!confirm('Tem certeza que deseja limpar o histórico de alterações?')) return;

    historicoAlteracoes = [];
    salvarProdutos();
    renderizarHistoricos();
    mostrarMensagem('✓ Histórico de alterações limpo com sucesso');
}

function downloadJSON() {
    const dataStr = JSON.stringify({ produtos }, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `produtos-gametech-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    mostrarMensagem('✓ Arquivo JSON baixado com sucesso!');
}

function uploadJSON(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const data = JSON.parse(e.target.result);
            if (data.produtos && Array.isArray(data.produtos)) {
                produtos = data.produtos;
                salvarProdutos();
                renderizarTabela();
                mostrarMensagem('✓ Produtos importados com sucesso!');
            } else {
                alert('⚠️ Formato JSON inválido. O arquivo deve conter um array "produtos".');
            }
        } catch (error) {
            alert('❌ Erro ao ler o arquivo: ' + error.message);
        }
    };
    reader.readAsText(file);
}

// ========== FUNCIONALIDADES DE MÚLTIPLAS IMAGENS ==========
function adicionarImagem() {
    const container = document.getElementById('produtoImagensContainer');
    const itens = container.querySelectorAll('.imagem-item');
    const novoIndex = itens.length;
    
    const novoItem = document.createElement('div');
    novoItem.className = 'imagem-item';
    novoItem.setAttribute('data-index', novoIndex);
    novoItem.innerHTML = `
        <input type="text" class="produto-imagem-url" value="" placeholder="URL da imagem ${novoIndex + 1}" oninput="atualizarPreviewPorURLMultiplo(${novoIndex})">
        <button type="button" onclick="removerImagem(${novoIndex})" class="btn-remover-imagem">❌</button>
        <img class="preview-imagem-multiplo" src="" alt="Preview ${novoIndex + 1}" style="display: none;">
    `;
    
    container.appendChild(novoItem);
}

function removerImagem(index) {
    const container = document.getElementById('produtoImagensContainer');
    const itens = container.querySelectorAll('.imagem-item');
    
    if (itens.length <= 1) {
        alert('⚠️ O produto deve ter pelo menos uma imagem!');
        return;
    }
    
    const itemParaRemover = container.querySelector(`.imagem-item[data-index="${index}"]`);
    if (itemParaRemover) {
        itemParaRemover.remove();
        reordenarIndicesImagens();
    }
}

function reordenarIndicesImagens() {
    const container = document.getElementById('produtoImagensContainer');
    const itens = container.querySelectorAll('.imagem-item');
    
    itens.forEach((item, index) => {
        item.setAttribute('data-index', index);
        const input = item.querySelector('.produto-imagem-url');
        const button = item.querySelector('.btn-remover-imagem');
        const img = item.querySelector('.preview-imagem-multiplo');
        
        input.placeholder = `URL da imagem ${index + 1}`;
        input.setAttribute('oninput', `atualizarPreviewPorURLMultiplo(${index})`);
        button.setAttribute('onclick', `removerImagem(${index})`);
        img.alt = `Preview ${index + 1}`;
    });
}

function atualizarPreviewPorURLMultiplo(index) {
    const container = document.getElementById('produtoImagensContainer');
    const item = container.querySelector(`.imagem-item[data-index="${index}"]`);
    if (!item) return;
    
    const input = item.querySelector('.produto-imagem-url');
    const preview = item.querySelector('.preview-imagem-multiplo');
    
    const url = input.value.trim();
    if (!url) {
        preview.src = '';
        preview.style.display = 'none';
        return;
    }

    preview.src = url;
    preview.style.display = 'block';
}

function processarUploadImagemMultiplo(event) {
    const files = event.target.files;
    // Processar todas as imagens selecionadas
    Array.from(files).forEach(file => processarArquivoImagemMultiplas(file));
    event.target.value = ''; // Reset input
}

function configurarDragDropMultiplo() {
    const dropZone = document.getElementById('imagemDropZone');
    if (!dropZone) return;

    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('dragover');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'))
            .forEach(file => processarArquivoImagemMultiplas(file));
    });
}

function processarArquivoImagemMultiplas(file) {
    if (!file.type.startsWith('image/')) {
        alert('⚠️ Por favor, selecione arquivos de imagem válidos.');
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        const dataURL = e.target.result;
        uploadedImagesDataURLs.push(dataURL);

        const container = document.getElementById('produtoImagensContainer');
        const itens = container.querySelectorAll('.imagem-item');
        const novoIndex = itens.length;

        const novoItem = document.createElement('div');
        novoItem.className = 'imagem-item';
        novoItem.setAttribute('data-index', novoIndex);
        novoItem.innerHTML = `
            <input type="text" class="produto-imagem-url" value="${dataURL}" placeholder="URL da imagem ${novoIndex + 1}" oninput="atualizarPreviewPorURLMultiplo(${novoIndex})">
            <button type="button" onclick="removerImagem(${novoIndex})" class="btn-remover-imagem">❌</button>
            <img class="preview-imagem-multiplo" src="${dataURL}" alt="Preview ${novoIndex + 1}" style="display: block">
        `;

        container.appendChild(novoItem);
        mostrarMensagem('✓ Imagem adicionada com sucesso!');
    };
    reader.readAsDataURL(file);
}

// ========== FUNCIONALIDADES DE PROMOÇÃO ==========
let produtoEmPromocao = null;

function abrirModalPromocao(index) {
    produtoEmPromocao = index;
    const produto = produtos[index];
    
    document.getElementById('produtoPromocaoNome').value = produto.nome;
    document.getElementById('produtoDesconto').value = produto.desconto || '';
    document.getElementById('produtoPrecoOriginal').value = `R$ ${produto.preco.toFixed(2)}`;
    
    atualizarPrecoComDesconto();
    document.getElementById('modalPromocao').classList.add('ativo');
    document.getElementById('produtoDesconto').focus();
}

function atualizarPrecoComDesconto() {
    const desconto = parseFloat(document.getElementById('produtoDesconto').value) || 0;
    const produto = produtos[produtoEmPromocao];
    const precoComDesconto = produto.preco * (1 - desconto / 100);
    
    document.getElementById('produtoPrecoComDesconto').value = `R$ ${precoComDesconto.toFixed(2)}`;
}

function salvarPromocao(event) {
    event.preventDefault();
    
    const desconto = parseFloat(document.getElementById('produtoDesconto').value);
    if (isNaN(desconto) || desconto < 0 || desconto > 100) {
        alert('⚠️ Digite um desconto válido entre 0 e 100%');
        return;
    }
    
    const produto = produtos[produtoEmPromocao];
    const descontoAnterior = produto.desconto || 0;
    
    produto.desconto = desconto;
    
    // Registrar alteração no histórico
    historicoAlteracoes.unshift({
        data: new Date().toLocaleString(),
        produto: produto.nome,
        campo: 'desconto',
        valorAnterior: `${descontoAnterior}%`,
        valorAtual: `${desconto}%`
    });
    
    salvarProdutos();
    renderizarTabela();
    fecharModalPromocao();
    mostrarMensagem('✓ Promoção aplicada com sucesso!');
}

function removerPromocao() {
    if (!confirm('Tem certeza que deseja remover a promoção deste produto?')) return;
    
    const produto = produtos[produtoEmPromocao];
    const descontoAnterior = produto.desconto || 0;
    
    delete produto.desconto;
    
    // Registrar alteração no histórico
    historicoAlteracoes.unshift({
        data: new Date().toLocaleString(),
        produto: produto.nome,
        campo: 'desconto',
        valorAnterior: `${descontoAnterior}%`,
        valorAtual: 'removido'
    });
    
    salvarProdutos();
    renderizarTabela();
    fecharModalPromocao();
    mostrarMensagem('✓ Promoção removida com sucesso!');
}

function fecharModalPromocao() {
    document.getElementById('modalPromocao').classList.remove('ativo');
    produtoEmPromocao = null;
}

// Adicionar event listener para atualizar preço em tempo real
document.addEventListener('DOMContentLoaded', function() {
    const descontoInput = document.getElementById('produtoDesconto');
    if (descontoInput) {
        descontoInput.addEventListener('input', atualizarPrecoComDesconto);
    }
});

function mostrarMensagem(texto) {
    const msg = document.getElementById('mensagensucesso');
    msg.textContent = texto;
    msg.classList.add('show');
    setTimeout(() => msg.classList.remove('show'), 3000);
}

document.getElementById('modalProduto').addEventListener('click', (e) => {
    if (e.target.id === 'modalProduto') fecharModal();
});

// Configurar upload de imagem por drag/drop e inicializar login
configurarDragDropMultiplo();
configurarUploadImagem();
verificarAutenticacao();
