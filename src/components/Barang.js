import { computed, watch } from 'vue';
import Papa from 'papaparse'

export async function fetchCSVData(items, originalList, progress, loading, no_WA){
  const sheetURL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRrGSG8Z8tG17P4XMyD-isiHjbezV-T49oFE0ARJnVZqdMOK0iJDWYtuWTfiGb65HsDc0Ae0C2b7JV-/pubhtml";
  loading.value = true;
  progress.value = 0;

  let step = 0;

  const interval = setInterval(() => {
    if (step < 95) { 
      step += 5;
      progress.value = step;
    }
  }, 50);
  try {
    const response = await fetch(sheetURL);
    const data = await response.text();

    const rows = data.split("\n");
    no_WA.value = rows[0]?.split(",")[8]
      ?.replace(/^No\s*WA:\s*/, "")
      .trim()
      .replace(/^0/, "62") || ""; 

    const parsed = Papa.parse(data, { header: true });
    items.value = parsed.data.map(row => ({
      barang: row['Barang']?.trim() || '',
      jumlah: row['Jumlah']?.trim() || '',
      harga: row['Harga Asli']?.trim() || '',
      keterangan: row['Keterangan']?.trim().replace(/^"(.*)"$/, '$1') || '',
      diskon: row['Diskon']?.trim() || '',
      gambar: [row['Gambar1'], row['Gambar2'], row['Gambar3']].map(g => g?.trim() || ''),
    }));
    originalList.value = [...items.value];
 
    progress.value = 100;
  } catch (error) {
    console.error("Error fetching CSV:", error);
  } finally {
    clearInterval(interval);
    loading.value = false;
  }
}

export function discountedPrice(harga, diskon) {

  const numberHarga = parseInt(harga.replace(/[^0-9]/g, '')) || 0;
  
  if (!diskon || parseFloat(diskon.toString().replace('%', '')) === 0) {
    return numberHarga.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }
  const parsedDiskon = parseFloat(diskon.toString().replace('%', ''));
  const final = Math.round(numberHarga * (1 - parsedDiskon / 100));
  return final.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}
export function masukanbarang(barang, harga, gambar, diskon, keranjang) {
  const existing = keranjang.find((item) => item.barang === barang);
  const hargaAsli = discountedPrice(harga, diskon);
  if (!existing) {
    keranjang.push({
      barang,
      hargaAsli,
      gambar, 
      diskon,
      jumlah: 1,
    });
  }
}


export function add(barang, keranjang) {
  const found = keranjang.find((item) => item.barang === barang);
  if (found) {
    found.jumlah += 1;
  }
  
}
export function subtrack(barang, keranjang) {
  const index = keranjang.findIndex((item) => item.barang === barang);
  if (index !== -1) {
    if (keranjang[index].jumlah > 1) {
      keranjang[index].jumlah -= 1;
    } else {
      keranjang.splice(index, 1);
    }
  }
}

export function useBarangState(keranjang) {
    const totalJumlah = computed(() => {
      return keranjang.value.reduce((sum, item) => sum + item.jumlah, 0);
    });
  
    const totalHarga = computed(() => {
      const total = keranjang.value.reduce((sum, item) => {
        
        const cleanHarga = parseInt(item.hargaAsli.replace(/[^0-9]/g, '')) || 0;
        return sum + item.jumlah * cleanHarga;
      }, 0);
      return total.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    });
    return {
        totalJumlah,
        totalHarga
      };
}

export function useSearchWatcher(searchQuery, items, originalList) {
  const applySearch = debounce((query) => {
      query = query.toLowerCase();
      if (!query) {
        items.value.splice(0, items.value.length, ...originalList.value);
      } else {
        const filtered = originalList.value.filter(item =>
          item.barang.toLowerCase().includes(query)
        );
        items.value.splice(0, items.value.length, ...filtered);
      }
   }, 100);

    watch(searchQuery, (newQuery) => {
      applySearch(newQuery);
    });
  }
export function openPopup(item,selectedItem,showPopup) {
    selectedItem.value = item;
    showPopup = true;
  }

function debounce(func, wait) {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  }

