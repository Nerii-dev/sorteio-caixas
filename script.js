// Valores disponíveis para cada caixa com probabilidades
const valoresPorCaixa = {
    azul: [
        { valor: 30, probabilidade: 65 }, // 65% de chance
        { valor: 40, probabilidade: 35 }, // 35% de chance
    ],
    amarelo: [
        { valor: 50, probabilidade: 40 },
        { valor: 70, probabilidade: 40 },
        { valor: 100, probabilidade: 20 }
    ],
    verde: [
        { valor: 10, probabilidade: 65 },
        { valor: 20, probabilidade: 35 }
    ]
};

// Limites iniciais de premiação
const limitesIniciais = {
    azul: { 30: 23, 40: 7 },
    amarelo: { 50: 20, 70: 8, 100: 2 },
    verde: { 10: 23, 20: 7 }
};

// Controle de limites de premiação
let limitesPremiacao = JSON.parse(JSON.stringify(limitesIniciais)); // Deep copy

// Variável para controlar se um sorteio está em andamento
let sorteioEmAndamento = false;

// Função para sortear um valor com limites e probabilidades
function sortearValor(caixa) {
    const valores = valoresPorCaixa[caixa];
    const limites = limitesPremiacao[caixa];

    // Filtra os valores que ainda podem ser sorteados
    const valoresDisponiveis = valores.filter(item => limites[item.valor] > 0);

    if (valoresDisponiveis.length === 0) {
        return null; // Nenhum valor disponível para sorteio
    }

    // Calcula o total de probabilidades
    const totalProbabilidade = valoresDisponiveis.reduce((acc, item) => acc + item.probabilidade, 0);

    // Sorteia um número entre 0 e o total de probabilidades
    const valorSorteado = Math.random() * totalProbabilidade;

    // Encontra o valor correspondente ao número sorteado
    let acumulado = 0;
    for (const item of valoresDisponiveis) {
        acumulado += item.probabilidade;
        if (valorSorteado <= acumulado) {
            // Verifica se o valor atingiu o limite
            if (limites[item.valor] === 0) {
                return { valor: item.valor, limiteAtingido: true }; // Limite atingido
            }
            // Atualiza o limite do valor sorteado
            if (limites[item.valor] !== Infinity) {
                limitesPremiacao[caixa][item.valor] -= 1;
            }
            return { valor: item.valor, limiteAtingido: false }; // Valor sorteado
        }
    }
}

// Função para resetar os limites
function resetarLimites() {
    if (confirm("Tem certeza que deseja resetar os limites de premiação?")) {
        // Exibe o carregamento
        const carregando = document.getElementById("carregando");
        carregando.style.display = "block";

        // Limpa o resultado da premiação
        document.getElementById("resultado").textContent = "";

        // Simula um tempo de carregamento (2 segundos)
        setTimeout(() => {
            // Reseta os limites
            Object.assign(limitesPremiacao, JSON.parse(JSON.stringify(limitesIniciais)));

            // Oculta o carregamento
            carregando.style.display = "none";

            // Exibe uma mensagem de sucesso
            alert("Limites resetados com sucesso!");
        }, 2000); // Tempo de carregamento simulado
    }
}

// Função para disparar confete
function dispararConfete() {
    confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
    });
}

// Evento de clique no botão de resetar limites
document.getElementById("resetar-limites").addEventListener("click", resetarLimites);

// Evento de clique em cada caixa
document.querySelectorAll(".caixa").forEach(caixa => {
    caixa.addEventListener("click", () => {
        // Verifica se já há um sorteio em andamento
        if (sorteioEmAndamento) return;
        sorteioEmAndamento = true;

        // Limpa a mensagem anterior
        document.getElementById("resultado").textContent = "";

        // Desabilita o clique em todas as caixas
        document.querySelectorAll(".caixa").forEach(c => {
            c.style.pointerEvents = "none";
        });

        // Tocar som de abertura
        const somAbertura = document.getElementById("som-abertura");
        somAbertura.play();

        // Animação de abertura da caixa
        caixa.classList.add("abrindo");

        // Efeito de brilho
        caixa.classList.add("aberta");

        // Efeito de fumaça
        const fumaca = document.getElementById("fumaca");
        fumaca.style.display = "block";
        fumaca.classList.add("ativa");

        // Sortear um valor após a animação
        setTimeout(() => {
            const corCaixa = caixa.getAttribute("data-cor");
            const resultadoSorteio = sortearValor(corCaixa);

            if (resultadoSorteio === null) {
                document.getElementById("resultado").textContent = "Não há mais prêmios disponíveis nesta caixa.";
                caixa.style.opacity = "0.5";
                caixa.style.pointerEvents = "none";
            } else if (resultadoSorteio.limiteAtingido) {
                document.getElementById("resultado").textContent = `O valor R$ ${resultadoSorteio.valor.toFixed(2)} atingiu o limite de sorteios.`;
            } else {
                // Tocar som de revelação
                const somRevelacao = document.getElementById("som-revelacao");
                somRevelacao.play();

                // Exibir resultado com animação
                document.getElementById("resultado").textContent = `Você ganhou: R$ ${resultadoSorteio.valor.toFixed(2)}`;

                // Disparar confete
                dispararConfete();
            }

            // Remove as animações após 2 segundos
            setTimeout(() => {
                caixa.classList.remove("abrindo", "aberta");
                fumaca.style.display = "none";
                fumaca.classList.remove("ativa");

                // Reabilita o clique em todas as caixas
                document.querySelectorAll(".caixa").forEach(c => {
                    c.style.pointerEvents = "auto";
                });

                // Libera para um novo sorteio
                sorteioEmAndamento = false;
            }, 2000); // Tempo de animação
        }, 1000); // Tempo de espera para o sorteio
    });
});