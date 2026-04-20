document.getElementById('xmlInput').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(e.target.result, "text/xml");

        // 1. Extração de Dados Cabeçalho 
        const nNF = xmlDoc.getElementsByTagName("nNF")[0]?.textContent;
        const dhEmi = xmlDoc.getElementsByTagName("dhEmi")[0]?.textContent.split('T')[0];
        const destinatario = xmlDoc.getElementsByTagName("dest")[0]?.getElementsByTagName("xNome")[0]?.textContent;
        const transportadora = xmlDoc.getElementsByTagName("transporta")[0]?.getElementsByTagName("xNome")[0]?.textContent;
        const volumes = xmlDoc.getElementsByTagName("qVol")[0]?.textContent || "0";

        // Atualizar interface
        document.getElementById('outNF').textContent = nNF;
        document.getElementById('outData').textContent = dhEmi;
        document.getElementById('outDestinatario').textContent = destinatario;
        document.getElementById('outTransportadora').textContent = transportadora;
        document.getElementById('outVolumes').textContent = volumes;

        // 2. Extração de Itens 
        const itens = xmlDoc.getElementsByTagName("det");
        const tbody = document.querySelector("#tabelaItens tbody");
        tbody.innerHTML = ""; // Limpar tabela anterior

        for (let i = 0; i < itens.length; i++) {
            const nome = itens[i].getElementsByTagName("xProd")[0]?.textContent;
            const qtd = itens[i].getElementsByTagName("qCom")[0]?.textContent;

            const row = `<tr>
                <td>${parseFloat(qtd).toFixed(0)}</td>
                <td>${nome}</td>
                <td style="width: 50px; text-align: center;">[ ]</td>
            </tr>`;
            tbody.innerHTML += row;
        }
    };
    reader.readAsText(file);
});