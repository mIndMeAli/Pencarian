document.addEventListener("DOMContentLoaded", async function () {
    let stkp = document.getElementById("stkp");
    let search = document.getElementById("search");
    let searchButton = document.getElementById("searchButton");
    let noInputMessage = document.getElementById("noInputMessage");

    fullData = await fetchAllData();

    stkp.addEventListener("change", async function () {
        let isDisabled = !stkp.value;
        search.disabled = isDisabled;
        searchButton.disabled = isDisabled;
        noInputMessage.style.display = isDisabled ? "block" : "none";

        if (!isDisabled) {
            try {
                let response = await fetch("https://script.google.com/macros/s/AKfycbykiB5UbOlG3d20C54ULCNzjbmt6FGFvc9haWf2mRDt_MR53Aw7DcqCayewA7BT-FDT/exec") ;
                let data = await response.json();
                search.value = data.nama;
            } catch {
                console.error("Gagal mengambil data:", error);
            }

            search.focus();
        }
    });

    searchButton.addEventListener("click", filterTable);
});

let fullData = [];

async function fetchAllData() {
    let apiURL = "https://script.google.com/macros/s/AKfycbykiB5UbOlG3d20C54ULCNzjbmt6FGFvc9haWf2mRDt_MR53Aw7DcqCayewA7BT-FDT/exec";

    try {
        const response = await fetch(apiURL);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();

        if (!data.PPPK || !data.PNS) {
            throw new Error("Format data tidak sesuai");
        }
        
        fullData = data;
        return data;
    } catch (error) {
        console.error("❌ Error mengambil data:", error);
        return { PPPK: [], PNS: [] };
    }
}

function convertRow(row) {
    return {
        NIP: row.c[1]?.v || '-',
        Nama: row.c[2]?.v || '-',
        "Unit Kerja": row.c[3]?.v || '-',
        "Jenis Pengusulan": row.c[4]?.v || '-',
        "Tanggal Usul Diterima BKPSDM": row.c[5]?.v || '-',
        "Status Usulan": row.c[6]?.v || '-',
        Keterangan: row.c[7]?.v || '-',
        PIC: row.c[8]?.v || '-'
    };
}

async function filterTable() {
    let input = document.getElementById("search").value.toLowerCase().trim();
    let stkp = document.getElementById("stkp").value;
    let table = document.getElementById("dataTable");
    let tbody = table.querySelector("tbody");
    let noDataMessage = document.getElementById("noDataMessage");
    let errorMessage = document.getElementById("errorMessage");

    if (!input) {
        errorMessage.innerText = "Masukkan NIP atau Nama terlebih dahulu!";
        errorMessage.style.display = "block";
        table.style.display = "none";
        return;
    }

    errorMessage.style.display = "none";

    if (!stkp) {
        noDataMessage.innerText = "Pilih status kepegawaian terlebih dahulu!";
        noDataMessage.style.display = "block";
        table.style.display = "none";
        return;
    }

    console.log("🔍 Data sebelum filter:", fullData);

    if (!fullData || typeof fullData !== "object" || !fullData[stkp]) {
        noDataMessage.innerText = "Data belum siap, coba lagi nanti!";
        noDataMessage.style.display = "block";
        table.style.display = "none";
        return;
    }

    let filteredData = (fullData[stkp] || []).filter(row => 
        row.NIP?.toLowerCase().includes(input) || row.Nama?.toLowerCase().includes(input)
    );

    if (filteredData.length === 0) {
        noDataMessage.innerText = "Data tidak ditemukan";
        noDataMessage.style.display = "block";
        table.style.display = "none";
        return;
    }

    noDataMessage.style.display = "none";
    table.style.display = "table";
    populateTable(filteredData);
}

function populateTable(data) {
    let tbody = document.querySelector("#dataTable tbody");
    tbody.innerHTML = "";

    data.forEach((row, index) => {
        let tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${row.NIP || '-'}</td>
            <td>${row.Nama || '-'}</td>
            <td>${row["Unit Kerja"] || '-'}</td>
            <td>${row["Jenis Pengusulan"] || '-'}</td>
            <td>${row["Tanggal Usul Diterima BKPSDM"] || '-'}</td>
            <td>${row["Status Usulan"] || '-'}</td>
            <td>${row.Keterangan || '-'}</td>
            <td>${row.PIC || '-'}</td>
        `;
        tbody.appendChild(tr);
    });
}
