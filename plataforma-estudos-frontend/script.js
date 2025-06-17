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

            card.innerHTML = `
                <h2>${resumo.titulo}</h2>
                <p>${resumo.conteudo}</p>
                <small>Tags: ${Array.isArray(resumo.tags) && resumo.tags.length > 0 ? resumo.tags.join(', ') : 'Sem tags'}</small>
                <div class="card-actions">
                    <button class="btn-edit">✏️ Editar</button>
                    <button class="btn-delete">🗑️ Excluir</button>
            `;

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

                        const mensagem = document.getElementById('mensagem-status');
                        if (mensagem) {
                            mensagem.textContent = 'Resumo excluído com sucesso!';
                            mensagem.style.color = 'green';
                            setTimeout(() => { mensagem.textContent = ''; }, 3000);
                        }
                        carregarResumos(); // Recarrega a lista de resumos

                    } catch (erro) {
                        console.error('Erro ao excluir:', erro.message);
                        alert('Erro ao excluir o resumo.');
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
// Função principal para buscar e exibir os flashcards
async function carregarFlashcards() {
    const container = document.getElementById('flashcards-container');

    try {
        const resposta = await fetch('http://localhost:5000/flashcards');
        if (!resposta.ok) throw new Error('Erro ao buscar flashcards');
        const flashcards = await resposta.json();

        // Limpa o container, mas mantém o título H2
        container.innerHTML = '<h2>🧠 Flashcards cadastrados</h2>';

        if (flashcards.length === 0) {
            const p = document.createElement('p');
            p.textContent = 'Nenhum flashcard encontrado.';
            container.appendChild(p);
            return;
        }

        flashcards.forEach((card) => {
            // CORRIGIDO: O nome da variável é CardDiv, não div.
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
            
            // Lógica para mostrar/ocultar resposta
            const btnMostrarResposta = CardDiv.querySelector('.btn-toggle');
            if (btnMostrarResposta) {
                btnMostrarResposta.addEventListener('click', () => {
                    const aberto = CardDiv.classList.toggle('mostrar');
                    btnMostrarResposta.textContent = aberto ? '🙈 Ocultar resposta' : '👁️ Mostrar resposta';
                });
            }

            // CORRIGIDO: Lógica de edição única e correta
            const botaoEditar = CardDiv.querySelector('.btn-edit');
            if (botaoEditar) {
                botaoEditar.addEventListener('click', () => {
                    prepararEdicaoFlashcard(card); // Usa a função correta
                    document.getElementById('flashcard-form').scrollIntoView({ behavior: 'smooth' });
                });
            }

            // Adicione aqui a lógica para o botão de deletar, se desejar, seguindo o mesmo padrão.

            container.appendChild(CardDiv);

            // CORRIGIDO: Lógica de destaque usando a variável correta `card`
            if (typeof window.idUltimoFlashcardModificado !== "undefined" && card._id === window.idUltimoFlashcardModificado) {
                CardDiv.classList.add('flashcard-destaque');
                setTimeout(() => {
                    CardDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    setTimeout(() => CardDiv.classList.remove('flashcard-destaque'), 2000);
                }, 300);
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
            if (mensagem) {
                mensagem.textContent = 'Preencha todos os campos obrigatórios.';
                mensagem.style.color = 'red';
            }
            return;
        }

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


            if (mensagem) {
                mensagem.textContent = idResumoEditando
                    ? 'Resumo editado com sucesso!'
                    : 'Resumo cadastrado com sucesso!';
                mensagem.style.color = 'green';
                setTimeout(() => { mensagem.textContent = ''; }, 3000);
            }

            window.idUltimoResumoModificado = resumoSalvo._id;

            form.reset();
            idResumoEditando = null;
            if (botao) botao.textContent = 'Cadastrar Resumo';
            if (cancelarBtn) cancelarBtn.style.display = 'none';

            carregarResumos();

        } catch (erro) {
            console.error(erro);
            if (mensagem) {
                mensagem.textContent = erro.message;
                mensagem.style.color = 'red';
            }
        }
    });

    if (cancelarBtn) {
        cancelarBtn.addEventListener('click', () => {
            form.reset();
            idResumoEditando = null;
            if (botao) botao.textContent = 'Cadastrar Resumo';
            if (mensagem) mensagem.textContent = '';
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

        const pergunta = document.getElementById('pergunta').value.trim();
        const resposta = document.getElementById('resposta').value.trim();
        const tagsString = document.getElementById('tags-flashcard').value.trim();
        const tagsArray = tagsString ? tagsString.split(',').map(tag => tag.trim()) : [];

        if (!pergunta || !resposta) {
            if (mensagemFlashcard) {
                mensagemFlashcard.textContent = 'Preencha todos os campos obrigatórios.';
                mensagemFlashcard.style.color = 'red';
                mensagemFlashcard.style.display = 'block';
            }
            document.getElementById('pergunta').focus();
            return;
        }

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
                if (mensagemFlashcard) {
                    mensagemFlashcard.textContent = 'Essa pergunta já foi cadastrada em outro flashcard.';
                    mensagemFlashcard.style.color = 'red';
                    mensagemFlashcard.style.display = 'block';
                    setTimeout(() => {
                        if (mensagemFlashcard) {
                            mensagemFlashcard.style.display = 'none';
                            mensagemFlashcard.textContent = '';
                        }
                    }, 3000);
                }
                document.getElementById('pergunta').focus();
                return;
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

            window.idUltimoFlashcardCriado = flashcardSalvo._id; // Usar idUltimoFlashcardModificado seria semanticamente melhor para edição, mas mantido nome original

            if (mensagemFlashcard) {
                mensagemFlashcard.textContent = idFlashcardEditando ? 'Flashcard editado com sucesso!' : 'Flashcard cadastrado com sucesso!';
                mensagemFlashcard.style.color = 'green';
                mensagemFlashcard.style.display = 'block';
                setTimeout(() => {
                    if (mensagemFlashcard) {
                        mensagemFlashcard.style.display = 'none';
                        mensagemFlashcard.textContent = '';
                    }
                }, 3000);
            }

            formFlashcard.reset();
            idFlashcardEditando = null; // Reseta o ID de edição
            const submitButton = formFlashcard.querySelector('button[type="submit"]');
            if (submitButton) {
                submitButton.textContent = 'Salvar Flashcard'; // Restaura texto do botão
            }

            document.getElementById('cancelar-edicao-flashcard').style.display = 'none';
            
            carregarFlashcards();

        } catch (error) {
            console.error('Cadastro/Edição de flashcard falhou:', error);
            if (mensagemFlashcard) {
                mensagemFlashcard.textContent = error.message;
                mensagemFlashcard.style.color = 'red';
                mensagemFlashcard.style.display = 'block';
            }
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
        botaoSubmit.textContent = 'Salvar Flashcard';
        botaoCancelar.style.display = 'none';
    });
}

// Inicialização ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
    configurarFormulario(); // Configura formulário de resumos
    configurarFormularioFlashcard();
    carregarResumos();
    carregarFlashcards();
    // O event listener para formFlashcard é adicionado globalmente quando o script é lido
});
