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
        <br />
        <button class="editar-btn" data-id="${resumo._id}">✏️ Editar</button>
        <button class="deletar-btn" data-id="${resumo._id}">🗑️ Excluir</button>
    `;

      // Botão editar
        card.querySelector('.editar-btn')
        .addEventListener('click', () => prepararEdicaoResumo(resumo));

      // Botão deletar
        card.querySelector('.deletar-btn')
        .addEventListener('click', async () => {
            if (!confirm('Tem certeza que deseja excluir este resumo?')) return;

            try {
            const resp = await fetch(`http://localhost:5000/resumos/${resumo._id}`, { method: 'DELETE' });
            if (!resp.ok) throw new Error('Erro ao excluir resumo.');

            const mensagem = document.getElementById('mensagem-status');
            mensagem.textContent = 'Resumo excluído com sucesso!';
            mensagem.style.color = 'green';
            carregarResumos();

            setTimeout(() => { mensagem.textContent = ''; }, 3000);
            } catch (erro) {
            console.error('Erro ao excluir:', erro.message);
            alert('Erro ao excluir o resumo.');
            }
        });

        container.appendChild(card);

        if (
            typeof window.idUltimoResumoModificado !== "undefined" &&
            resumo._id === window.idUltimoResumoModificado
        ) {
            card.classList.add('resumo-destaque');

            setTimeout(() => {
                card.scrollIntoView({ behavior: 'smooth', block: 'center' });
                setTimeout(() => card.classList.remove('resumo-destaque'), 2000);
            }, 3000);
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
        const div = document.createElement('div');
        div.classList.add('flashcard');

    div.innerHTML = `
        <p><strong>Pergunta:</strong> ${card.pergunta}</p>
        <p class="resposta"><strong>Resposta:</strong> ${card.resposta}</p>
        <small>Tags: ${Array.isArray(card.tags) && card.tags.length > 0 ? card.tags.join(', ') : 'Sem tags'}</small>
        <button class="mostrar-resposta">👁️ Mostrar resposta</button>
    `;

        const btn = div.querySelector('.mostrar-resposta');
        const respEl = div.querySelector('.resposta');

    btn.addEventListener('click', () => {
        const aberto = div.classList.toggle('mostrar');
        btn.textContent = aberto ? '🙈 Ocultar resposta' : '👁️ Mostrar resposta';
    });

        container.appendChild(div);

        if (typeof window.idUltimoFlashcardCriado !== "undefined" && card._id === window.idUltimoFlashcardCriado) {
        div.classList.add('flashcard-destaque');

        setTimeout(() => {
    div.scrollIntoView({ behavior: 'smooth', block: 'center' });
    // Limpa o destaque após um tempo, se quiser
    setTimeout(() => div.classList.remove('flashcard-destaque'), 2000);
    }, 300);
}
    });
    } catch (erro) {
    container.innerHTML = '<p class="erro">Erro ao carregar os flashcards 😥</p>';
    console.error('Erro ao carregar os flashcards:', erro.message);
}
}

// Variável de controle para saber se estamos editando
let idResumoEditando = null;

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
        mensagem.textContent = 'Preencha todos os campos obrigatórios.';
        mensagem.style.color = 'red';
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
    
    const resumoSalvo = await resposta.json();
    if (!resposta.ok) throw new Error(`Erro ao ${idResumoEditando ? 'editar' : 'cadastrar'} resumo.`);

    mensagem.textContent = idResumoEditando
        ? 'Resumo editado com sucesso!'
        : 'Resumo cadastrado com sucesso!';
        mensagem.style.color = 'green';

        window.idUltimoResumoModificado = resumoSalvo._id;

        form.reset();
        idResumoEditando = null;
        botao.textContent = 'Cadastrar Resumo';
        cancelarBtn.style.display = 'none';

        carregarResumos();

    setTimeout(() => { mensagem.textContent = ''; 
    }, 3000);
    } catch (erro) {
        console.error(erro);
        mensagem.textContent = erro.message;
        mensagem.style.color = 'red';
    }
});

cancelarBtn.addEventListener('click', () => {
    form.reset();
    idResumoEditando = null;
    botao.textContent = 'Cadastrar Resumo';
    mensagem.textContent = '';
    cancelarBtn.style.display = 'none';
    });
}

// Prepara o formulário para edição de um resumo existente
function prepararEdicaoResumo(resumo) {
    document.getElementById('titulo').value = resumo.titulo;
    document.getElementById('conteudo').value = resumo.conteudo;
    document.getElementById('tags').value = resumo.tags.join(', ');
    document.getElementById('cancelar-edicao').style.display = 'inline-block';
    
    const botao = document.querySelector('#form-resumo button[type="submit"]');
    botao.textContent = 'Salvar Edição';

idResumoEditando = resumo._id;
}

// Bloco de cadastro de flashcards
const formFlashcard = document.getElementById('form-flashcard');
const mensagemFlashcard = document.getElementById('mensagem-flashcard');

formFlashcard.addEventListener('submit', async (e) => {
    e.preventDefault();

    const pergunta = document.getElementById('pergunta').value.trim();
    const resposta = document.getElementById('resposta').value.trim();
    
    const tagsString = document.getElementById('tags-flashcard').value.trim();
    const tagsArray = tagsString ? tagsString.split(',').map(tag => tag.trim()) : [];

if (!pergunta || !resposta) {
    mensagemFlashcard.textContent = 'Preencha todos os campos obrigatórios.';
    mensagemFlashcard.style.color = 'red';
    mensagemFlashcard.style.display = 'block';
    document.getElementById('pergunta').focus();
    return;
}

try {
    // Verificar duplicidade
    const respostaFlashcards = await fetch('http://localhost:5000/flashcards');
    const listaAtual = await respostaFlashcards.json();

    const jaExiste = listaAtual.some(fc =>
        fc.pergunta.toLowerCase().trim() === pergunta.toLowerCase().trim()
    );

    if (jaExiste) {
        mensagemFlashcard.textContent = 'Essa pergunta ja foi cadastrada.';
        mensagemFlashcard.style.color = 'red';
        mensagemFlashcard.style.display = 'block';
        document.getElementById('pergunta').focus();

            setTimeout(() => {
        mensagemFlashcard.style.display = 'none';
        mensagemFlashcard.textContent = '';
    }, 3000);
    
        return;
    }
    
    const response = await fetch('http://localhost:5000/flashcards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pergunta, resposta, tags: tagsArray })
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.erro || errorData.message || 'Erro ao cadastrar flashcard');
    }

    const novoFlashcard = await response.json();
    window.idUltimoFlashcardCriado = novoFlashcard._id;

    mensagemFlashcard.textContent = 'Flashcard cadastrado com sucesso!';
    mensagemFlashcard.style.color = 'green';
    mensagemFlashcard.style.display = 'block';

    formFlashcard.reset();
    carregarFlashcards();

    // Oculta mensagem após 3 segundos
    setTimeout(() => {
        mensagemFlashcard.style.display = 'none';
        mensagemFlashcard.textContent = '';
    }, 3000);

} catch (error) {
    console.error('Cadastro falhou:', error);
    mensagemFlashcard.textContent = error.message;
    mensagemFlashcard.style.color = 'red';
    mensagemFlashcard.style.display = 'block';
    }
});

// Inicialização ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
    configurarFormulario();
    carregarResumos();
    carregarFlashcards();
});
