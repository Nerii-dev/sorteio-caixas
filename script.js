// Valores disponíveis para cada caixa com probabilidades
const valoresPorCaixa = {
    azul: [
        { valor: 30, probabilidade: 75 }, // 75% de chance
        { valor: 40, probabilidade: 25 }, // 25% de chance
    ],
    amarelo: [
        { valor: 50, probabilidade: 50 },
        { valor: 70, probabilidade: 40 },
        { valor: 100, probabilidade: 10 }
    ],
    verde: [
        { valor: 10, probabilidade: 75 },
        { valor: 20, probabilidade: 25 }
    ]
};

// Controle de limites de premiação
const limitesPremiacao = {
    azul: {
        30: 23, // R$ 30 pode ser sorteado 23 vezes
        40: 7
    },
    amarelo: {
        50: 20,
        70: 8,
        100: 2
    },
    verde: {
        10: 23,
        20: 7
    }
};

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
        for (const cor in limitesPremiacao) {
            for (const valor in limitesPremiacao[cor]) {
                if (limitesPremiacao[cor][valor] !== Infinity) {
                    limitesPremiacao[cor][valor] = valoresPorCaixa[cor].find(item => item.valor === Number(valor)).probabilidade;
                }
            }
        }
        alert("Limites resetados com sucesso!");
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

        // Sortear um valor após a animação
        setTimeout(() => {
            const corCaixa = caixa.getAttribute("data-cor");
            const resultadoSorteio = sortearValor(corCaixa);

            if (resultadoSorteio === null) {
                document.getElementById("resultado").textContent = "Não há mais prêmios disponíveis nesta caixa.";
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

                // Reabilita o clique em todas as caixas
                document.querySelectorAll(".caixa").forEach(c => {
                    c.style.pointerEvents = "auto";
                });

                // Libera para um novo sorteio
                sorteioEmAndamento = false;
            }, 2000);
        }, 1000); // Tempo para a animação de abertura terminar
    });
});