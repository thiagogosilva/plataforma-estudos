function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.classList.add('toast', type);
    toast.textContent = message;
    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('show')
    }, 100);

    setTimeout(() => {
        toast.classList.remove('show');

        toast.addEventListener('transitionend', () => {
            toast.remove();
        });
    }, 3000);
}

// Função principal para buscar e exibir os resumos
async function carregarResumos() {
    const container = document.getElementById('resumos-container');

    try {
        const resposta = await fetch('http://localhost:5000/resumos');
        if (!resposta.ok) throw new Error('Erro ao buscar os resumos');
        const resumos = await resposta.json();

        container.innerHTML = '';
        if (resumos.length === 0) {
            container.innerHTML = '<p>Nenhum resumo encontrado.</p>';
            return;
        }

        resumos.forEach((resumo) => {
            const card = document.createElement('div');
            card.classList.add('resumo-card');

            card._id = resumo._id;

            const limiteCaracteres = 250;
            let conteudoHtml = `<p class="resumo-conteudo">${resumo.conteudo}</p>`;
            let precisaDeBotao = resumo.conteudo.length > limiteCaracteres;

            if (precisaDeBotao) {
                conteudoHtml = `<p class="resumo-conteudo truncado">${resumo.conteudo}</p>
                                <button class="btn-mostrar-mais">Mostrar mais</button>`;
            }

            card.innerHTML = `
                <h2>${resumo.titulo}</h2>
                ${conteudoHtml}
                <small>Tags: ${Array.isArray(resumo.tags) && resumo.tags.length > 0 ? resumo.tags.join(', ') : 'Sem tags'}</small>
                <div class="card-actions">
                    <button class="btn-edit">✏️ Editar</button>
                    <button class="btn-delete">🗑️ Excluir</button>
            `;

            if (precisaDeBotao) {
                const btnMostrarMais = card.querySelector('.btn-mostrar-mais');
                const conteudoP = card.querySelector('.resumo-conteudo');

                btnMostrarMais.addEventListener('click', () => {
                    conteudoP.classList.toggle('truncado');

                    if (conteudoP.classList.contains('truncado')) {
                        btnMostrarMais.textContent = 'Mostrar mais';
                    card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                    } else {
                        btnMostrarMais.textContent = 'Mostrar menos';
                    }
                });
            }

            // Botão editar
            const editarBtn = card.querySelector('.btn-edit');
            if (editarBtn) {
                editarBtn.addEventListener('click', () => prepararEdicaoResumo(resumo));
            }

            // Botão deletar
            const deletarBtn = card.querySelector('.btn-delete');
            if (deletarBtn) {
                deletarBtn.addEventListener('click', async () => {
                    if (!confirm('Tem certeza que deseja excluir este resumo?')) return;

                    try {
                        const resp = await fetch(`http://localhost:5000/resumos/${resumo._id}`, { method: 'DELETE' });
                        if (!resp.ok) throw new Error('Erro ao excluir resumo.');

                    showToast('Resumo excluído com sucesso!', 'success');

                        carregarResumos(); // Recarrega a lista de resumos

                    } catch (erro) {
                        showToast(`Erro ao excluir resumo: ${erro.message}`, 'error');
                    }
                });
            }

            container.appendChild(card);

            if (
                typeof window.idUltimoResumoModificado !== "undefined" &&
                resumo._id === window.idUltimoResumoModificado
            ) {
                card.classList.add('resumo-destaque');

                setTimeout(() => {
                    card.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    // Limpa o destaque após a rolagem e um tempo
                    setTimeout(() => card.classList.remove('resumo-destaque'), 2000);
                }, 300); // 300ms para rolagem mais imediata, similar aos flashcards
            }
        });
    } catch (erro) {
        container.innerHTML = `<p class="erro">Erro ao carregar os resumos 😥</p>`;
        console.error('Erro ao carregar os resumos:', erro.message);
    }
}

// Função principal para buscar e exibir os flashcards
async function carregarFlashcards() {
    const container = document.getElementById('flashcards-container');

    try {
        const resposta = await fetch('http://localhost:5000/flashcards');
        if (!resposta.ok) throw new Error('Erro ao buscar flashcards');
        const flashcards = await resposta.json();

        container.innerHTML = '<h2>🧠 Flashcards cadastrados</h2>';

        if (flashcards.length === 0) {
            container.innerHTML += '<p>Nenhum flashcard encontrado.</p>';
            return;
        }

        flashcards.forEach((card) => {
            const CardDiv = document.createElement('div');
            CardDiv.classList.add('flashcard');

            CardDiv.innerHTML = `
                <p><strong>Pergunta:</strong> ${card.pergunta}</p>
                <p class="resposta"><strong>Resposta:</strong> ${card.resposta}</p>
                <small>Tags: ${Array.isArray(card.tags) && card.tags.length > 0 ? card.tags.join(', ') : 'Sem tags'}</small>
                <div class="card-actions">
                    <button class="btn-toggle mostrar-resposta">👁️ Mostrar resposta</button>
                    <button class="btn-edit">✏️ Editar</button>
                    <button class="btn-delete">🗑️ Excluir</button>
                </div>
            `;
            
            const btnMostrarResposta = CardDiv.querySelector('.btn-toggle');
            if (btnMostrarResposta) {
                btnMostrarResposta.addEventListener('click', () => {
                    const aberto = CardDiv.classList.toggle('mostrar');
                    btnMostrarResposta.textContent = aberto ? '🙈 Ocultar resposta' : '👁️ Mostrar resposta';
                });
            }

            const botaoEditar = CardDiv.querySelector('.btn-edit');
            if (botaoEditar) {
                botaoEditar.addEventListener('click', () => {
                    prepararEdicaoFlashcard(card);
                    document.getElementById('flashcard-form').scrollIntoView({ behavior: 'smooth' });
                });
            }

            const botaoDeletar = CardDiv.querySelector('.btn-delete');
            if (botaoDeletar) {
                botaoDeletar.addEventListener('click', async () => {
                    if (!confirm(`Tem certeza que deseja excluir o flashcard: "${card.pergunta}"?`)) return;
                    try {
                        const resp = await fetch(`http://localhost:5000/flashcards/${card._id}`, { method: 'DELETE' });
                        if (!resp.ok) throw new Error('Falha ao excluir o flashcard.');
                        
                        showToast('Flashcard excluído com sucesso!', 'success');
                        
                        setTimeout(() => {
                            carregarFlashcards();
                        }, 300);
                        
                    } catch (erro) {
                        showToast(`Erro ao excluir flashcard: ${erro.message}`, 'error');
                    }
                });
            }

            container.appendChild(CardDiv);

            // CORRIGIDO: Lógica de destaque completa e correta
            if (window.idUltimoFlashcardModificado && card._id === window.idUltimoFlashcardModificado) {
                CardDiv.classList.add('flashcard-destaque');
                CardDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
                setTimeout(() => {
                    // CORRIGIDO: Remove a classe em vez de adicionar novamente
                    CardDiv.classList.remove('flashcard-destaque');
                    // CORRIGIDO: Limpa a variável para não destacar de novo
                    window.idUltimoFlashcardModificado = null;
                }, 2000);
            }
        });
    } catch (erro) {
        container.innerHTML = '<h2>🧠 Flashcards cadastrados</h2><p class="erro">Erro ao carregar os flashcards 😥</p>';
        console.error('Erro ao carregar os flashcards:', erro.message);
    }
}

// Variável de controle para saber se estamos editando
let idResumoEditando = null;
let idFlashcardEditando = null;

let idUltimoResumoModificado = null;
let idUltimoFlashcardModificado = null;

// Configura formulário de resumos para POST ou PUT
function configurarFormulario() {
    const form = document.getElementById('form-resumo');
    const mensagem = document.getElementById('mensagem-status');
    const botao = form.querySelector('button[type="submit"]');
    const cancelarBtn = document.getElementById('cancelar-edicao');

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const titulo = document.getElementById('titulo').value.trim();
        const conteudo = document.getElementById('conteudo').value.trim();
        const tagsTexto = document.getElementById('tags').value.trim();
        const tags = tagsTexto ? tagsTexto.split(',').map(t => t.trim()) : [];

        if (!titulo || !conteudo) {
            showToast('Preencha todos os campos obrigatórios.', 'error');
            return;
        }

        const textoOriginalBotao = botao.textContent;

        botao.disabled = true;
        botao.textContent = 'Salvando...';

        try {
            const url = idResumoEditando
                ? `http://localhost:5000/resumos/${idResumoEditando}`
                : 'http://localhost:5000/resumos';
            const method = idResumoEditando ? 'PUT' : 'POST';

            const resposta = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ titulo, conteudo, tags })
            });

            const resumoSalvo = await resposta.json(); // Tenta parsear JSON mesmo se não for OK, para pegar msg de erro do backend
            if (!resposta.ok) {
                // Se o backend envia erro no corpo JSON: { "message": "Algum erro" } ou { "erro": "Algum erro" }
                throw new Error(resumoSalvo.message || resumoSalvo.erro || `Erro ao ${idResumoEditando ? 'editar' : 'cadastrar'} resumo.`);
            }


        showToast(
            idResumoEditando ? 'Resumo editado com sucesso!' : 'Resumo cadastrado com sucesso!',
            'success'
        );

            window.idUltimoResumoModificado = resumoSalvo._id;

            form.reset();
            idResumoEditando = null;
            if (botao) botao.textContent = 'Cadastrar Resumo';
            if (cancelarBtn) cancelarBtn.style.display = 'none';

            carregarResumos();

        } catch (erro) {
            console.error(erro);
            showToast(erro.message, 'error');

            botao.textContent = textoOriginalBotao;
        } finally {
            botao.disabled = false;
        }
    });

    if (cancelarBtn) {
        cancelarBtn.addEventListener('click', () => {
            form.reset();
            idResumoEditando = null;
            if (botao) botao.textContent = 'Cadastrar Resumo';
            
            cancelarBtn.style.display = 'none';
        });
    }
}

// Prepara o formulário para edição de um resumo existente
function prepararEdicaoResumo(resumo) {
    document.getElementById('titulo').value = resumo.titulo;
    document.getElementById('conteudo').value = resumo.conteudo;

    // Verificar se resumo.tags é array antes de join
    document.getElementById('tags').value = Array.isArray(resumo.tags) ? resumo.tags.join(', ') : '';
    
    const cancelarBtn = document.getElementById('cancelar-edicao');
    if (cancelarBtn) cancelarBtn.style.display = 'inline-block';

    const botao = document.querySelector('#form-resumo button[type="submit"]');
    if (botao) botao.textContent = 'Salvar Edição';

    idResumoEditando = resumo._id;

    // Rolar para o formulário e focar
    const formElement = document.getElementById('form-resumo');
    if (formElement) {
        formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    document.getElementById('titulo').focus();
}

function prepararEdicaoFlashcard(flashcard) {
    const perguntaInput = document.getElementById('pergunta');
    const respostaInput = document.getElementById('resposta');
    const tagsInput = document.getElementById('tags-flashcard');
    const botaoSubmit = document.querySelector('#form-flashcard button[type="submit"]');
    const botaoCancelar = document.getElementById('cancelar-edicao-flashcard');

    perguntaInput.value = flashcard.pergunta;
    respostaInput.value = flashcard.resposta;
    tagsInput.value = flashcard.tags.join(', ');

    idFlashcardEditando = flashcard._id;
    botaoSubmit.textContent = 'Salvar Edição';
    botaoCancelar.style.display = 'inline-block';
}

// Bloco de cadastro de flashcards
const formFlashcard = document.getElementById('form-flashcard');
const mensagemFlashcard = document.getElementById('mensagem-flashcard');

if (formFlashcard) {
    formFlashcard.addEventListener('submit', async (e) => {
        e.preventDefault();

        const submitButton = formFlashcard.querySelector('button[type="submit"]');

        const pergunta = document.getElementById('pergunta').value.trim();
        const resposta = document.getElementById('resposta').value.trim();
        const tagsString = document.getElementById('tags-flashcard').value.trim();
        const tagsArray = tagsString ? tagsString.split(',').map(tag => tag.trim()) : [];

        if (!pergunta || !resposta) {
            showToast('Preencha todos os campos obrigatórios.', 'error');
            document.getElementById('pergunta').focus();
            return;
        }

        const textoOriginalBotao = submitButton.textContent;

        submitButton.disabled = true;
        submitButton.textContent = 'Salvando...';

        try {
            // Verificar duplicidade
            const respostaFlashcards = await fetch('http://localhost:5000/flashcards');
            const listaAtual = await respostaFlashcards.json();

            const perguntaLowerTrimmed = pergunta.toLowerCase().trim();

            // Lógica de duplicidade para considerar edição
            const jaExiste = listaAtual.some(fc =>
                fc.pergunta.toLowerCase().trim() === perguntaLowerTrimmed &&
                (!idFlashcardEditando || fc._id !== idFlashcardEditando)
            );

            if (jaExiste) {
                throw new Error('Já existe um flashcard com essa pergunta.');
            }

            const url = idFlashcardEditando
                ? `http://localhost:5000/flashcards/${idFlashcardEditando}`
                : 'http://localhost:5000/flashcards';
            const method = idFlashcardEditando ? 'PUT' : 'POST';

            const fetchResponse = await fetch(url, { // Renomeado para fetchResponse para não conflitar com 'resposta' (do flashcard)
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pergunta, resposta, tags: tagsArray })
            });

            const flashcardSalvo = await fetchResponse.json(); // Tenta parsear JSON mesmo se não for OK
            if (!fetchResponse.ok) {
                throw new Error(flashcardSalvo.erro || flashcardSalvo.message || `Erro ao ${idFlashcardEditando ? 'editar' : 'cadastrar'} flashcard`);
            }

            window.idUltimoFlashcardModificado = flashcardSalvo._id;

            showToast(
                idFlashcardEditando ? 'Flashcard editado com sucesso!' : 'Flashcard cadastrado com sucesso!',
                'success');

            formFlashcard.reset();
            idFlashcardEditando = null; // Reseta o ID de edição
            const submitButton = formFlashcard.querySelector('button[type="submit"]');
            if (submitButton) {
                submitButton.textContent = 'Cadastrar Flashcard'; // Restaura texto do botão
            }

            document.getElementById('cancelar-edicao-flashcard').style.display = 'none';
            
            setTimeout(() => carregarFlashcards(), 300);
            
            carregarFlashcards();

        } catch (error) {
            console.error('Cadastro/Edição de flashcard falhou:', error);
            showToast(error.message, 'error');

            submitButton.textContent = textoOriginalBotao; // Restaura texto do botão
        } finally {
            submitButton.disabled = false;
        }
    });
}

function configurarFormularioFlashcard() {
    const form = document.getElementById('form-flashcard');
    const botaoSubmit = form.querySelector('button[type="submit"]');
    const botaoCancelar = document.getElementById('cancelar-edicao-flashcard');

    botaoCancelar.addEventListener('click', () => {
        form.reset();
        idFlashcardEditando = null;
        botaoSubmit.textContent = 'Cadastrar Flashcard';
        botaoCancelar.style.display = 'none';
    });
}

function configurarFiltroResumos() {
    const filtroInput = document.getElementById('filtro-resumos');
    filtroInput.addEventListener('input', () => {
        const termoBusca = filtroInput.value.trim().toLowerCase();
        const resumosCards = document.querySelectorAll('.resumo-card');

        resumosCards.forEach(card => {
            const titulo = card.querySelector('h2').textContent.toLowerCase();
            const conteudo = card.querySelector('p').textContent.toLowerCase();

            if (titulo.includes(termoBusca) || conteudo.includes(termoBusca)) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    });
}

function configurarFiltroFlashcards() {
    const filtroInput = document.getElementById('filtro-flashcards');
    filtroInput.addEventListener('input', () => {
        const termoBusca = filtroInput.value.trim().toLowerCase();
        const flashcards = document.querySelectorAll('.flashcard');

        flashcards.forEach(card => {
            const perguntaEl = card.querySelector('p');
            const respostaEl = card.querySelector('p.resposta');

            const pergunta = perguntaEl ? perguntaEl.textContent.toLowerCase() : '';
            const resposta = respostaEl ? respostaEl.textContent.toLowerCase() : '';

            if (pergunta.includes(termoBusca) || resposta.includes(termoBusca)) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    });
}

function configurarBotaoVoltarAoTopo() {
    const btn = document.getElementById('btn-voltar-ao-topo');
    if (!btn) return; // Se o botão não existir, nao faz nada

    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            btn.classList.add('show'); // Mostra o botão
        } else {
            btn.classList.remove('show'); // Esconde o botão
        }
    });

    btn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth' // Faz a rolagem ser suave e animada
        });
    });
}

// Inicialização ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
    configurarFormulario(); // Configura formulário de resumos
    configurarFormularioFlashcard();
    configurarFiltroResumos();
    configurarFiltroFlashcards();
    configurarBotaoVoltarAoTopo();
    carregarResumos();
    carregarFlashcards();
    // O event listener para formFlashcard é adicionado globalmente quando o script é lido
});
