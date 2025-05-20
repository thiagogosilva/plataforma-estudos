// Função principal para buscar e exibir os resumos
async function carregarResumos() {
    const container = document.getElementById('resumos-container');

    try{
        // Requisição GET para a API (rota / resumos)
        const resposta = await fetch('http://localhost:5000/resumos');

        // Se a resposta não for OK, lança erro manual
        if (!resposta.ok){
            throw new Error('Erro ao buscar os resumos');
        }
        const resumos = await resposta.json();

        // Remove o texto "🔁 Carregando resumos..."
        container.innerHTML = '';

        // Verifica se vieram resumos
        if (resumos.length === 0) {
            container.innerHTML = '<p>Nenhum resumo encontrado.</p>';
            return;
        }

        // Cria um card para cada resumo
        resumos.forEach((resumo) => {
            const card = document.createElement('div');
            card.classList.add('resumo-card');

            card.innerHTML = `
            <h2>${resumo.titulo}</h2>
            <p>${resumo.conteudo}</p>
            <small>Tags: ${resumo.tags.join(', ')}</small>
            `;

            container.appendChild(card);
        });
    } catch (erro) {
        container.innerHTML = `<p class="erro">Erro ao carregar os resumos 😥</p>`;
        console.error('Erro ao carregar os resumos:', erro.message);
    }
}

// Nova função para lidar com o envio do formulário
function configurarFormulario() {
    const form = document.getElementById('form-resumo');
    const mensagem = document.getElementById('mensagem-status');

    form.addEventListener('submit', async (event) => {
        event.preventDefault(); // Evita o carregamento da página

        // Captura os valores dos campos
        const titulo = document.getElementById('titulo').value.trim();
        const conteudo = document.getElementById('conteudo').value.trim();
        const tagsTexto = document.getElementById('tags').value.trim();
        const tags = tagsTexto ? tagsTexto.split(',').map(tag => tag.trim()) : [];
        
        // Validação simples (só para garantir)
        if (!titulo || !conteudo) {
            mensagem.textContent = 'Preencha todos os campos obrigatórios.';
            mensagem.style.color = 'red';
            return;
        }

        try {
            // Envia para o backend com fetch (POST)
            const resposta = await fetch('http://localhost:5000/resumos', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ titulo, conteudo, tags }),
            });

            if (!resposta.ok) {
                throw new Error('Erro ao cadastrar resumo.');
            }

            // Limpa campos e exibe mensagem
            form.reset();
            mensagem.textContent = 'Resumo cadastrado com sucesso!';
            mensagem.style.color = 'green';

            // Atualiza a lista automaticamente
            carregarResumos();

            // Remove a mensagem após 3 segundos
            setTimeout(() => {
                mensagem.textContent = '';
            }, 3000);
        } catch (erro) {
            console.error(erro);
            mensagem.textContent = ' Erro ao cadastrar resumo.';
            mensagem.style.color = 'red';
        }
    });
}

// Executa a função assim que a página carregar
document.addEventListener('DOMContentLoaded', () => {
    carregarResumos();
    configurarFormulario(); // Adiciona o listener ao formulário
});