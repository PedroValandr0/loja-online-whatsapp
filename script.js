// ========================================
// BANCO DE DADOS DE PRODUTOS
// ========================================
let produtosDb = [];

// Carregar produtos do banco de dados
async function carregarProdutosDb() {
    try {
        const produtosSalvos = localStorage.getItem('produtosGameTech');
        if (produtosSalvos) {
            produtosDb = JSON.parse(produtosSalvos);
            console.log('✓ Produtos carregados do localStorage');
        } else {
            // Tentar carregar do JSON se não houver no localStorage
            const response = await fetch('produtos.json');
            const data = await response.json();
            produtosDb = data.produtos;
            salvarProdutosDb();
            console.log('✓ Produtos carregados do JSON');
        }
        renderizarProdutos();
        return produtosDb;
    } catch (error) {
        console.error('Erro ao carregar produtos:', error);
        // Usar dados padrão como fallback
        produtosDb = [];
    }
}

// Salvar produtos no localStorage
function salvarProdutosDb() {
    localStorage.setItem('produtosGameTech', JSON.stringify(produtosDb));
    console.log('✓ Banco de dados atualizado');
}

// Renderizar produtos na página
function renderizarProdutos() {
    const produtosList = document.getElementById('produtos-list');
    
    if (!produtosList) {
        console.warn('Elemento #produtos-list não encontrado');
        return;
    }

    produtosList.innerHTML = produtosDb.map((produto, index) => {
        const emEstoque = produto.quantidade > 0;
        const statusClasse = emEstoque ? 'em-estoque' : 'indisponivel';
        const statusTexto = emEstoque ? `✅ ${produto.quantidade} em estoque` : '❌ Indisponível';
        const btnDesabilitado = emEstoque ? '' : 'disabled';
        const btnTexto = emEstoque ? 'Adicionar ao Carrinho' : 'Indisponível';
        
        // Lógica de desconto
        const temDesconto = produto.desconto && produto.desconto > 0;
        const precoOriginal = produto.preco;
        const precoComDesconto = temDesconto ? precoOriginal * (1 - produto.desconto / 100) : precoOriginal;
        const precoDisplay = temDesconto ? 
            `<span class="preco-original">R$ ${precoOriginal.toFixed(2)}</span> <span class="preco-desconto">R$ ${precoComDesconto.toFixed(2)}</span>` : 
            `R$ ${precoOriginal.toFixed(2)}`;
        const badgePromocao = temDesconto ? `<div class="badge-promocao">-${produto.desconto}% OFF</div>` : '';
        
        // Lógica de imagens múltiplas
        const imagens = Array.isArray(produto.imagens) && produto.imagens.length > 0 ? produto.imagens : [produto.imagem || 'https://via.placeholder.com/400x300'];
        const temMultiplasImagens = imagens.length > 1;
        const carrosselImagens = imagens.map((img, imgIndex) => 
            `<img src="${img}" alt="${produto.nome} - imagem ${imgIndex + 1}" class="${imgIndex === 0 ? 'ativo' : ''}">`
        ).join('');
        
        const controlesCarrossel = temMultiplasImagens ? `
            <button class="carrossel-btn carrossel-prev" onclick="navegarCarrossel(${produto.id}, -1)" aria-label="Imagem anterior">‹</button>
            <button class="carrossel-btn carrossel-next" onclick="navegarCarrossel(${produto.id}, 1)" aria-label="Próxima imagem">›</button>
            <div class="carrossel-indicadores">
                ${imagens.map((_, imgIndex) => 
                    `<span class="indicador ${imgIndex === 0 ? 'ativo' : ''}" onclick="irParaImagem(${produto.id}, ${imgIndex})"></span>`
                ).join('')}
            </div>
        ` : '';
        
        return `
            <article class="${temDesconto ? 'produto-promocao' : ''}" data-produto-id="${produto.id}">
                <div class="carrossel-imagens">
                    <div class="carrossel-container">
                        ${carrosselImagens}
                    </div>
                    ${controlesCarrossel}
                </div>
                ${badgePromocao}
                <h3>${produto.nome}</h3>
                <p>${produto.descricao}</p>
                <p class="preco-produto">${precoDisplay}</p>
                <p class="status-produto ${statusClasse}">${statusTexto}</p>
                <button class="btn-adicionar" 
                    data-id="${produto.id}" 
                    data-nome="${produto.nome}" 
                    data-preco="${precoComDesconto}" 
                    data-preco-original="${precoOriginal}"
                    data-desconto="${produto.desconto || 0}"
                    ${btnDesabilitado}>
                    ${btnTexto}
                </button>
            </article>
        `;
    }).join('');

    // Adicionar event listeners aos botões
    adicionarListenersProdutos();
}

// ========== FUNCIONALIDADES DO CARROSSEL ==========
function navegarCarrossel(produtoId, direcao) {
    const article = document.querySelector(`article[data-produto-id="${produtoId}"]`);
    if (!article) return;
    
    const imagens = article.querySelectorAll('.carrossel-container img');
    const indicadores = article.querySelectorAll('.indicador');
    
    if (imagens.length <= 1) return;
    
    // Encontrar imagem atual ativa
    let indiceAtual = 0;
    imagens.forEach((img, index) => {
        if (img.classList.contains('ativo')) {
            indiceAtual = index;
        }
    });
    
    // Calcular novo índice
    let novoIndice = indiceAtual + direcao;
    if (novoIndice < 0) novoIndice = imagens.length - 1;
    if (novoIndice >= imagens.length) novoIndice = 0;
    
    // Atualizar imagens
    imagens.forEach((img, index) => {
        img.classList.toggle('ativo', index === novoIndice);
    });
    
    // Atualizar indicadores
    indicadores.forEach((ind, index) => {
        ind.classList.toggle('ativo', index === novoIndice);
    });
}

function irParaImagem(produtoId, indiceImagem) {
    const article = document.querySelector(`article[data-produto-id="${produtoId}"]`);
    if (!article) return;
    
    const imagens = article.querySelectorAll('.carrossel-container img');
    const indicadores = article.querySelectorAll('.indicador');
    
    if (indiceImagem < 0 || indiceImagem >= imagens.length) return;
    
    // Atualizar imagens
    imagens.forEach((img, index) => {
        img.classList.toggle('ativo', index === indiceImagem);
    });
    
    // Atualizar indicadores
    indicadores.forEach((ind, index) => {
        ind.classList.toggle('ativo', index === indiceImagem);
    });
}

// Adicionar listeners aos botões de adicionar
function adicionarListenersProdutos() {
    document.querySelectorAll('.btn-adicionar:not([disabled])').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = parseInt(this.getAttribute('data-id'));
            const nome = this.getAttribute('data-nome');
            const preco = parseFloat(this.getAttribute('data-preco'));
            
            const produto = produtosDb.find(p => p.id === id);
            if (!produto || produto.quantidade <= 0) {
                alert('Este produto não está disponível no momento.');
                return;
            }

            // Capturar imagem
            const article = this.closest('article');
            const img = article.querySelector('img');
            const imagemUrl = img ? img.src : 'https://via.placeholder.com/80x80';
            
            // Verificar se já existe no carrinho
            const produtoExistente = carrinho.find(item => item.id === id);
            
            if (produtoExistente) {
                // Verificar se há estoque suficiente
                if (produtoExistente.quantidade < produto.quantidade) {
                    produtoExistente.quantidade++;
                } else {
                    alert('Quantidade máxima em estoque atingida!');
                    return;
                }
            } else {
                carrinho.push({
                    id: id,
                    nome: nome,
                    preco: preco,
                    quantidade: 1,
                    imagem: imagemUrl
                });
            }
            
            salvarCarrinho();
            podeFecharCarrinho = false;
            atualizarCarrinho();
            abrirCarrinho();
            animarBotao(this);
            
            setTimeout(() => {
                podeFecharCarrinho = true;
            }, 500);
        });
    });

    // Desabilitar botões de produtos sem estoque
    document.querySelectorAll('.btn-adicionar[disabled]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            alert('Este produto está indisponível no momento.');
        });
    });
}

// ========================================
// CARRINHO DE COMPRAS
// ========================================
let carrinho = [];
let podeFecharCarrinho = true;

const isMobile = () => window.innerWidth <= 768;

function verificarLocalStorage() {
    try {
        const teste = '__teste_localStorage__';
        localStorage.setItem(teste, teste);
        localStorage.removeItem(teste);
        return true;
    } catch (e) {
        console.warn('localStorage não disponível:', e);
        return false;
    }
}

const btnAdicionar = document.querySelectorAll('.btn-adicionar');
const carrinhoToggle = document.getElementById('carrinho-toggle');
const carrinhoSidebar = document.getElementById('carrinho-sidebar');
const carrinhoFechar = document.getElementById('carrinho-fechar');
const carrinhoItems = document.getElementById('carrinho-items');
const carrinhoCount = document.getElementById('carrinho-count');
const carrinhoTotal = document.getElementById('carrinho-total');
const carrinhoFinalizar = document.getElementById('carrinho-finalizar');

function carregarCarrinho() {
    try {
        const carrinhoSalvo = localStorage.getItem('carrinho');
        if (carrinhoSalvo) {
            carrinho = JSON.parse(carrinhoSalvo);
            console.log('✓ Carrinho carregado do localStorage:', carrinho);
            atualizarCarrinho();
        } else {
            console.log('✓ localStorage vazio - novo carrinho');
        }
    } catch (e) {
        console.error('Erro ao carregar carrinho:', e);
        carrinho = [];
    }
}

function salvarCarrinho() {
    try {
        localStorage.setItem('carrinho', JSON.stringify(carrinho));
        console.log('✓ Carrinho salvo no localStorage');
    } catch (e) {
        console.error('Erro ao salvar carrinho:', e);
        alert('Aviso: Não foi possível salvar o carrinho.');
    }
}

function animarBotao(btn) {
    btn.style.transform = 'scale(0.95)';
    setTimeout(() => {
        btn.style.transform = 'scale(1)';
    }, 100);
}

function atualizarCarrinho() {
    carrinhoCount.textContent = carrinho.reduce((total, item) => total + item.quantidade, 0);
    
    if (carrinho.length === 0) {
        carrinhoItems.innerHTML = '<p class="carrinho-vazio">Seu carrinho está vazio</p>';
        carrinhoFinalizar.disabled = true;
    } else {
        carrinhoItems.innerHTML = carrinho.map((item, index) => `
            <div class="carrinho-item">
                <img src="${item.imagem}" alt="${item.nome}" class="carrinho-item-img">
                <div class="item-info">
                    <h4>${item.nome}</h4>
                    <p>R$ ${item.preco.toFixed(2)}</p>
                </div>
                <div class="item-quantidade">
                    <button class="btn-menos" data-index="${index}">-</button>
                    <span>${item.quantidade}</span>
                    <button class="btn-mais" data-index="${index}">+</button>
                </div>
                <div class="item-subtotal">
                    R$ ${(item.preco * item.quantidade).toFixed(2)}
                </div>
                <button class="btn-remover" data-index="${index}">&times;</button>
            </div>
        `).join('');
        
        document.querySelectorAll('.btn-mais').forEach(btn => {
            btn.addEventListener('click', function() {
                aumentarQuantidade(parseInt(this.getAttribute('data-index')));
            });
        });
        
        document.querySelectorAll('.btn-menos').forEach(btn => {
            btn.addEventListener('click', function() {
                diminuirQuantidade(parseInt(this.getAttribute('data-index')));
            });
        });
        
        document.querySelectorAll('.btn-remover').forEach(btn => {
            btn.addEventListener('click', function() {
                removerProduto(parseInt(this.getAttribute('data-index')));
            });
        });
        
        carrinhoFinalizar.disabled = false;
    }
    
    const total = carrinho.reduce((sum, item) => sum + (item.preco * item.quantidade), 0);
    carrinhoTotal.textContent = `R$ ${total.toFixed(2)}`;
}

function aumentarQuantidade(index) {
    const item = carrinho[index];
    const produtoDb = produtosDb.find(p => p.id === item.id);
    
    // Validar se há estoque suficiente
    if (produtoDb && item.quantidade < produtoDb.quantidade) {
        item.quantidade++;
        salvarCarrinho();
        atualizarCarrinho();
    } else {
        alert('❌ Quantidade máxima em estoque atingida!');
    }
}

function diminuirQuantidade(index) {
    if (carrinho[index].quantidade > 1) {
        carrinho[index].quantidade--;
    } else {
        removerProduto(index);
        return;
    }
    salvarCarrinho();
    atualizarCarrinho();
}

function removerProduto(index) {
    podeFecharCarrinho = false;
    carrinho.splice(index, 1);
    salvarCarrinho();
    atualizarCarrinho();
    
    setTimeout(() => {
        podeFecharCarrinho = true;
    }, 100);
}

function abrirCarrinho() {
    carrinhoSidebar.classList.add('ativo');
}

function fecharCarrinho() {
    carrinhoSidebar.classList.remove('ativo');
}

carrinhoToggle.addEventListener('click', function(e) {
    e.preventDefault();
    if (carrinhoSidebar.classList.contains('ativo')) {
        fecharCarrinho();
    } else {
        abrirCarrinho();
    }
});

carrinhoFechar.addEventListener('click', fecharCarrinho);

document.addEventListener('click', function(e) {
    if (isMobile() && carrinhoSidebar.classList.contains('ativo')) {
        if (!carrinhoSidebar.contains(e.target) && e.target !== carrinhoToggle && !carrinhoToggle.contains(e.target)) {
            if (podeFecharCarrinho) {
                fecharCarrinho();
            }
        }
    }
});

// ========================================
// MODAL DE ENTREGA
// ========================================
const modalEntrega = document.getElementById('modal-entrega');
const modalFechar = document.getElementById('modal-fechar');
const btnCancelarModal = document.getElementById('btn-cancelar-modal');
const btnContinuarWhatsapp = document.getElementById('btn-continuar-whatsapp');
const opcoesEntrega = document.querySelectorAll('input[name="entrega"]');
const enderecoContainer = document.getElementById('endereco-container');
const enderecoInput = document.getElementById('endereco');

function abrirModal() {
    modalEntrega.classList.add('ativo');
    podeFecharCarrinho = false;
    if (isMobile()) {
        fecharCarrinho();
    }
}

function fecharModal() {
    modalEntrega.classList.remove('ativo');
    podeFecharCarrinho = true;
    opcoesEntrega.forEach(opt => opt.checked = false);
    enderecoInput.value = '';
    enderecoContainer.style.display = 'none';
}

opcoesEntrega.forEach(opcao => {
    opcao.addEventListener('change', function() {
        if (this.value === 'entrega') {
            enderecoContainer.style.display = 'block';
        } else {
            enderecoContainer.style.display = 'none';
            enderecoInput.value = '';
        }
    });
});

modalFechar.addEventListener('click', fecharModal);
btnCancelarModal.addEventListener('click', fecharModal);

modalEntrega.addEventListener('click', function(e) {
    if (e.target === this) {
        fecharModal();
    }
});

btnContinuarWhatsapp.addEventListener('click', function() {
    const tipoEntrega = document.querySelector('input[name="entrega"]:checked');
    const endereco = enderecoInput.value.trim();
    
    if (!tipoEntrega) {
        alert('Por favor, escolha uma forma de entrega!');
        return;
    }
    
    if (tipoEntrega.value === 'entrega' && !endereco) {
        alert('Por favor, preencha o endereço de entrega!');
        return;
    }
    
    enviarParaWhatsApp(tipoEntrega.value, endereco);
    fecharModal();
});

// ========================================
// WHATSAPP E FINALIZAÇÃO
// ========================================
function enviarParaWhatsApp(tipoEntrega, endereco) {
    if (carrinho.length > 0) {
        const numeroWhatsApp = '';// INSIRA O NÚMERO DE WHATSAPP AQUI (formato: 5511999999999)
        const total = carrinho.reduce((sum, item) => sum + (item.preco * item.quantidade), 0);
        
        let mensagem = '🛒 *NOVO PEDIDO GAMETECH*\n\n';
        mensagem += '*Itens do Pedido:*\n';
        
        carrinho.forEach((item, index) => {
            mensagem += `${index + 1}. ${item.nome}\n`;
            mensagem += `   Quantidade: ${item.quantidade}x\n`;
            mensagem += `   Preço unitário: R$ ${item.preco.toFixed(2).replace('.', ',')}\n`;
            mensagem += `   Subtotal: R$ ${(item.preco * item.quantidade).toFixed(2).replace('.', ',')}\n\n`;
        });
        
        mensagem += `*━━━━━━━━━━━━━━━━━━━━━━━━*\n`;
        mensagem += `💰 *TOTAL: R$ ${total.toFixed(2).replace('.', ',')}\n`;
        mensagem += `*━━━━━━━━━━━━━━━━━━━━━━━━*\n\n`;
        
        if (tipoEntrega === 'entrega') {
            mensagem += `📍 *ENTREGA EM CASA*\n`;
            mensagem += `Endereço: ${endereco}\n\n`;
        } else {
            mensagem += `🏪 *RETIRADA NA LOJA*\n`;
            mensagem += `Endereço da loja: Rua dos Gamers, 123 - São Paulo, SP\n\n`;
        }
        
        mensagem += `Olá! Gostaria de comprar esses itens da GameTech. 🎮`;
        
        const mensagemCodificada = encodeURIComponent(mensagem);
        const linkWhatsApp = `https://wa.me/${numeroWhatsApp}?text=${mensagemCodificada}`;
        
        // DIMINUIR QUANTIDADE NO BANCO DE DADOS
        carrinho.forEach(item => {
            const produto = produtosDb.find(p => p.id === item.id);
            if (produto) {
                const quantidadeAnterior = produto.quantidade;
                produto.quantidade -= item.quantidade;
                if (produto.quantidade < 0) {
                    produto.quantidade = 0;
                }
                console.log(`✓ ${produto.nome}: ${produto.quantidade} unidades restantes`);

                // Registrar historico de vendas e alteracoes (cliente)
                registrarHistoricoVenda({
                    data: new Date().toLocaleString(),
                    nome: produto.nome,
                    quantidade: item.quantidade,
                    precoUnitario: produto.preco,
                    total: produto.preco * item.quantidade
                });

                registrarHistoricoAlteracao({
                    data: new Date().toLocaleString(),
                    produto: produto.nome,
                    campo: 'quantidade',
                    valorAnterior: quantidadeAnterior,
                    valorAtual: produto.quantidade
                });
            }
        });
        
        // Salvar alterações no banco de dados
        salvarProdutosDb();
        
        // Recarregar produtos na página
        renderizarProdutos();
        
        window.open(linkWhatsApp, '_blank');
        
        carrinho = [];
        salvarCarrinho();
        atualizarCarrinho();
        fecharCarrinho();
        
        // Mostrar mensagem de sucesso
        alert('✓ Pedido enviado para WhatsApp! Os produtos foram decrementados do estoque.');
    }
}

carrinhoFinalizar.addEventListener('click', function() {
    if (carrinho.length > 0) {
        abrirModal();
    } else {
        alert('Seu carrinho está vazio!');
    }
});

// ========================================
// INICIALIZAÇÃO
// ========================================
console.log('🔄 Inicializando aplicação...');
console.log('📍 localStorage disponível:', verificarLocalStorage());

// Carregar produtos e depois carrinho
carregarProdutosDb().then(() => {
    carregarCarrinho();
    console.log('✓ Aplicação iniciada com sucesso!');
});

window.addEventListener('beforeunload', function() {
    salvarCarrinho();
});

document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
        salvarCarrinho();
        console.log('⏸ Página oculta - carrinho salvo');
    }
});

function registrarHistoricoVenda(venda) {
    const historicoVendas = JSON.parse(localStorage.getItem('historicoVendas') || '[]');
    historicoVendas.unshift(venda);
    localStorage.setItem('historicoVendas', JSON.stringify(historicoVendas));
}

function registrarHistoricoAlteracao(alteracao) {
    const historicoAlteracoes = JSON.parse(localStorage.getItem('historicoAlteracoes') || '[]');
    historicoAlteracoes.unshift(alteracao);
    localStorage.setItem('historicoAlteracoes', JSON.stringify(historicoAlteracoes));
}
