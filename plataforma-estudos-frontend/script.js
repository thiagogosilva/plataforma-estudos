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

// Executa a função assim que a página carregar
document.addEventListener('DOMContentLoaded', carregarResumos);