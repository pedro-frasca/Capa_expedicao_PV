// Dicionário de Transportadoras
const transpMap = {
    "AMAZON TRANSPORTES LTDA": "AMAZON",
    "ATUAL CARGAS TRANSPORTES LTDA": "ATUAL",
    "CJP EXPRESS LOG TRANSPORTES LTDA": "CJP",
    "CW LOGISTICA EM TRANSPORTES LTDA": "CWLOG",
    "DMARI - LOCACAO, TRANSPORTES E LOGISTICA LTDA": "DMARI",
    "ELLLOG LOGISTICA E TRANSPORTES EIRELI": "ELLLOG",
    "FAST-X TRANSPORTES LTDA": "FASTX",
    "RAPIDO FIGUEIREDO LOGISTICA E TRANSPORTES LTDA": "FIGUEIREDO",
    "TJ4 TRANSPORTES EIRELI": "FRILOG",
    "V.M.RAMOS & CIA LTDA": "GENEROSO",
    "LG DE CAMPOS TRANSPORTES": "IDEIA/LG",
    "LEMA REZENDE TRANSPORTES LTDA": "LEMA",
    "MIR TRANSPORTES E LOGISTICA LTDA": "MIRIN",
    "RAPIDO PANAMERICANO LTDA": "PANAMERICANO",
    "PASSARO TRANSPORTES LTDA": "PASSARO",
    "RODOGARCIA TRANSPORTES RODOVIARIOS LTDA": "RODOGARCIA",
    "SOLIDEZ TRANSPORTES LTDA": "SOLIDEZ",
    "SPEED TRANSPORTE MULTIMODAL DE CARGAS LIMITADA": "SPEED",
    "TADEX TRANSPORTES LTDA.": "TADEX",
    "TRANS CJ TRANSPORTE E LOGISTICA LTDA": "TRANSCJ",
    "HB TRANSPORTES E LOGISTICA EIRELI": "TRANSITO",
    "VIPEX TRANSPORTES LTDA": "VIPEX",
    "MANDA LÁ TRANSPORTES DE CARGAS LTDA": "MANDALA",
    "TRANSPORTADORA M.M.A LTDA": "MMA",
    "TRANSNORTEX CARGAS EIRELI": "NORTEX",
    "FORMATO TRANSPORTES LTDA": "FORMATO"
};

const coresMap = { 
    'PRETA': 'cor-preta', 'PRETO': 'cor-preta', 'AZUL': 'cor-azul', 
    'CINZA': 'cor-cinza', 'LARANJA': 'cor-laranja', 'BRANCO': 'cor-branco' 
};

function aplicarDestaques(texto, forcarModelo = false) {
    let divTemp = document.createElement("div");
    divTemp.innerHTML = texto;
    let nome = divTemp.innerText.toUpperCase();

    // Substituições Técnicas
    nome = nome.replace(/\bCOLUNAS?\b/g, "MONTANTE");
    nome = nome.replace(/\bPRATELEIRAS?\b/g, "PAR DE LONGARINA");

    // Lógica de Modelo (SLIM / MINI)
    if (nome.includes("MONTANTE") || nome.includes("LONGARINA")) {
        if (/\bSL\b/.test(nome)) {
            nome = nome.replace(/\bSL\b/g, '<span class="modelo-destaque">SLIM</span>');
        } else if (nome.includes("SLIM")) {
            nome = nome.replace(/\bSLIM\b/g, '<span class="modelo-destaque">SLIM</span>');
        } else if (forcarModelo && !nome.includes("MINI")) {
            nome += ' <span class="modelo-destaque">MINI</span>';
        } else if (nome.includes("MINI")) {
            nome = nome.replace(/\bMINI\b/g, '<span class="modelo-destaque">MINI</span>');
        }
    }

    // Cores
    Object.keys(coresMap).forEach(cor => {
        const regexCor = new RegExp(`\\b${cor}\\b`, 'g');
        if (regexCor.test(nome)) {
            nome = nome.replace(regexCor, `<span class="cor-grifada ${coresMap[cor]}">${cor}</span>`);
        }
    });

    return nome;
}

// Edição e Deleção
document.querySelector("#tabelaItens").addEventListener('click', function(event) {
    if (event.target.classList.contains('btn-del')) event.target.closest('tr').remove();
});

document.querySelector("#tabelaItens").addEventListener('blur', function(event) {
    if (event.target.classList.contains('editavel-nome')) {
        event.target.innerHTML = aplicarDestaques(event.target.innerText, false);
    }
}, true);

// Novo Item
document.getElementById('addItemBtn').addEventListener('click', function() {
    const tbody = document.querySelector("#tabelaItens tbody");
    const tr = document.createElement("tr");
    tr.innerHTML = `
        <td class="editavel-qtd" contenteditable="true" style="text-align: center;">1</td>
        <td class="editavel-nome" contenteditable="true">NOVO PRODUTO</td>
        <td style="text-align: center; font-size: 25px;">☐</td>
        <td class="no-print" style="text-align: center;"><button class="btn-del">X</button></td>
    `;
    tbody.appendChild(tr);
});

// Responsável
document.getElementById('responsavelSelect').addEventListener('change', function() {
    document.getElementById('outResponsavel').textContent = this.value;
});

// XML Reader
document.getElementById('xmlInput').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(e.target.result, "text/xml");
            const getTag = (name) => xmlDoc.getElementsByTagName(name)[0]?.textContent || "---";

            document.getElementById('outNF').textContent = getTag("nNF");
            const rawData = getTag("dhEmi");
            document.getElementById('outData').textContent = rawData ? rawData.split('T')[0].split('-').reverse().join('/') : "---";
            document.getElementById('outDestinatario').textContent = xmlDoc.querySelector("dest xNome")?.textContent || "---";
            
            // Lógica Transportadora
            let transpNF = (xmlDoc.querySelector("transporta xNome")?.textContent || "NÃO INFORMADO").toUpperCase().trim();
            document.getElementById('outTransportadora').textContent = transpMap[transpNF] || transpNF;

            document.getElementById('outVolumes').value = getTag("qVol") || "1";

            const itens = xmlDoc.getElementsByTagName("det");
            const tbody = document.querySelector("#tabelaItens tbody");
            tbody.innerHTML = "";

            for (let i = 0; i < itens.length; i++) {
                let nomeOriginal = itens[i].querySelector("xProd")?.textContent || "";
                const qtd = parseFloat(itens[i].querySelector("qCom")?.textContent || "0").toFixed(0);

                tbody.innerHTML += `<tr>
                    <td class="editavel-qtd" contenteditable="true" style="text-align: center;">${qtd}</td>
                    <td class="editavel-nome" contenteditable="true">${aplicarDestaques(nomeOriginal, true)}</td>
                    <td style="text-align: center; font-size: 25px;">☐</td>
                    <td class="no-print" style="text-align: center;"><button class="btn-del">X</button></td>
                </tr>`;
            }
        } catch (err) { alert("Erro ao ler o XML."); }
    };
    reader.readAsText(file);
});