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

    card.innerHTML = `
        <h2>${resumo.titulo}</h2>
        <p>${resumo.conteudo}</p>
        <small>Tags: ${resumo.tags.join(', ')}</small>
        <br />
        <button class="editar-btn" data-id="${resumo._id}">✏️ Editar</button>
        <button class="deletar-btn" data-id="${resumo._id}">🗑️ Excluir</button>
    `;

    // Botão editar
    const botaoEditar = card.querySelector('.editar-btn');
    botaoEditar.addEventListener('click', () => {
        prepararEdicaoResumo(resumo);
    });

    // Botão deletar
    const botaoDeletar = card.querySelector('.deletar-btn');
    botaoDeletar.addEventListener('click', async () => {
        const confirmacao = confirm('Tem certeza que deseja excluir este resumo?');
        if (!confirmacao) return;

        try {
            const resposta = await fetch(`http://localhost:5000/resumos/${resumo._id}`, {
                method: 'DELETE'
            });

            if (!resposta.ok) {
                throw new Error('Erro ao excluir resumo.');
            }

            const mensagem = document.getElementById('mensagem-status');
            mensagem.textContent = 'Resumo excluído com sucesso!';
            mensagem.style.color = 'green';

            carregarResumos();

            setTimeout(() => {
                mensagem.textContent = '';
            }, 3000);
            
        } catch (erro) {
            console.error('Erro ao excluir:', erro.message);
            alert('Erro ao excluir o resumo.');
        }
    });

    container.appendChild(card);
    });
} catch (erro) {
    container.innerHTML = `<p class="erro">Erro ao carregar os resumos 😥</p>`;
    console.error('Erro ao carregar os resumos:', erro.message);
    }
}

// Variável de controle para saber se estamos editando
let idResumoEditando = null;

// Configura o formulário para POST ou PUT
function configurarFormulario() {
    const form = document.getElementById('form-resumo');
    const mensagem = document.getElementById('mensagem-status');
    const botao = form.querySelector('button');

    form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const titulo = document.getElementById('titulo').value.trim();
    const conteudo = document.getElementById('conteudo').value.trim();
    const tagsTexto = document.getElementById('tags').value.trim();
    const tags = tagsTexto ? tagsTexto.split(',').map(tag => tag.trim()) : [];

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
        body: JSON.stringify({ titulo, conteudo, tags }),
    });

    if (!resposta.ok) {
        throw new Error(`Erro ao ${idResumoEditando ? 'editar' : 'cadastrar'} resumo.`);
    }

    const modoEdicao = idResumoEditando !== null;
    form.reset();
    idResumoEditando = null;
    botao.textContent = 'Cadastrar Resumo';

    mensagem.textContent = modoEdicao
        ? 'Resumo editado com sucesso!'
        : 'Resumo cadastrado com sucesso!';
    mensagem.style.color = 'green';

    carregarResumos();
    setTimeout(() => { mensagem.textContent = ''; }, 3000);
    } catch (erro) {
    console.error(erro);
    mensagem.textContent = erro.message;
    mensagem.style.color = 'red';
    }
    });

    const cancelarBtn = document.getElementById('cancelar-edicao');

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

    idResumoEditando = resumo._id;
    const botao = document.querySelector('#form-resumo button');
    botao.textContent = 'Salvar Edição';
}

// Quando a página carrega, executa as configurações iniciais
document.addEventListener('DOMContentLoaded', () => {
    configurarFormulario();
carregarResumos();
});
