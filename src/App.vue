
<script setup>
import { Head, Link } from '@inertiajs/vue3';
import { ref, onMounted} from 'vue';  
import { fetchCSVData, masukanbarang, add, subtrack, useBarangState, useSearchWatcher, openPopup, discountedPrice} from './components/Barang.js';
import { computed } from 'vue';

const nomer = ref(0);
const items = ref([]);
const showKeranjang = ref(false);
const keranjang = ref([]);
const originalList = ref([]);
const { totalJumlah, totalHarga } = useBarangState(keranjang);

const loading = ref(true); 
const progress = ref(0); 

onMounted(async() => {
    await fetchCSVData(items, originalList, progress, loading, nomer);
  });
const form = ref({
  nama: '',
  alamat: '',
  kelurahan: '',
  kecamatan: '',
  kota: '',
  kodepos: ''
});

const showErrors = ref(false);
function submitForm() {
    showErrors.value = true;
    if (
        !form.value.nama ||
        !form.value.alamat ||
        !form.value.kelurahan ||
        !form.value.kecamatan ||
        !form.value.kota
    ) {
        return;
    }
    kirimPesan();
}
function kirimPesan() {
    const encodedNama = encodeURIComponent(form.value.nama);
    const encodedAlamat = encodeURIComponent(form.value.alamat);
    const encodedKelurahan = encodeURIComponent(form.value.kelurahan);
    const encodedkecamatan = encodeURIComponent(form.value.kecamatan);
    const encodedKota = encodeURIComponent(form.value.kota);
    const encodedKodepos = encodeURIComponent(form.value.kodepos);
    const encodedBarang = encodeURIComponent(keranjang.value.map(item => `${item.barang} (${item.jumlah}xRp${item.hargaAsli})`).join(', '));
    const encodedTotalHarga = encodeURIComponent("Rp" + totalHarga.value);
    const url = `https://docs.google.com/forms/u/0/d/e/1FAIpQLSdArYLbxhEmnK9Rzi3KWp0oEhxUdFOHq9Q64yLxqVpY7mYoVw/formResponse` +
    `?entry.1397467379=${encodedNama}` +
    `&entry.1515742534=${encodedAlamat}` +
    `&entry.1477140648=${encodedKelurahan}` +
    `&entry.1876270830=${encodedkecamatan}` +
    `&entry.183900941=${encodedKota}` +
    `&entry.1983750981=${encodedKodepos}` +
    `&entry.103247122=${encodedBarang}` +
    `&entry.1697585335=${encodedTotalHarga}` +
    `&submit=Submit`;
    document.getElementById('hiddenForm').src = url;

    const message = `Halo, saya ingin memesan:
    Nama: ${form.value.nama}
    Alamat: ${form.value.alamat}
    Kelurahan: ${form.value.kelurahan}
    Kecamatan: ${form.value.kecamatan}
    Kota: ${form.value.kota}
    Kode Pos: ${form.value.kodepos}
    Barang: ${keranjang.value.map(item => `${item.barang} (${item.jumlah}xRp${item.hargaAsli})`).join(', ')}
    Total Harga: Rp${totalHarga.value}`;
    const encodedMessage = encodeURIComponent(message);
    const isMobile = /iPhone|Android|iPad|Android/i.test(navigator.userAgent);
    const baseURL = isMobile
        ? `whatsapp://send?phone=${nomer.value}&text=${encodedMessage}`
        : `https://wa.me/${nomer.value}?text=${encodedMessage}`;

    window.open(baseURL, '_blank');
}

const searchQuery = ref('');
useSearchWatcher(searchQuery, items, originalList);

const showPopup = ref(false);
const selectedItem = ref({});
const currentImageIndex= ref(0);
const slideDirection = ref('next');
function nextImage() {
    slideDirection.value = 'next';
    currentImageIndex.value = (currentImageIndex.value + 1) % selectedItem.value.value.gambar.length;
  }
function prevImage() {
    slideDirection.value = 'prev';
    currentImageIndex.value = (currentImageIndex.value  - 1 + selectedItem.value.value.gambar.length) % selectedItem.value.value.gambar.length;
  }
const touchStartX = ref(0);
const touchEndX = ref(0);
function startTouch(e) {
  touchStartX.value = e.changedTouches[0].screenX;
}
function endTouch(e) {
  touchEndX.value = e.changedTouches[0].screenX;
  handleSwipe();
}
function handleSwipe() {
  const distance = touchEndX.value - touchStartX.value;
  if (Math.abs(distance) > 20) { 
    if (distance < 0) {
      nextImage();
    } else {
      prevImage();
    }
  }
}

const currentPage = ref(1);
const itemsPerPage = ref(36);
const jumping = ref(false);
const jumpPage = ref('');
const paginatedItems = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return items.value.slice(start, end);
});
const totalPages = computed(() => {
  return Math.ceil(items.value.length / itemsPerPage.value);
});
const paginationRange = computed(() => {
  const total = totalPages.value;
  const current = currentPage.value;
  const delta = 1;
  const max= 7;
  const range = [];
  if (total <= max) {
    for (let i = 1; i <= total; i++) range.push(i);
  } else {
    if (current <= 4) {
      range.push(1, 2, 3, 4, 5, '...', total);
    } else if (current >= total - 3) {
      range.push(1, '...', total - 4, total - 3, total - 2, total - 1, total);
    } else {
      range.push(1, '...', current - 1, current, current + 1, '...', total);
    }
  }
  return range;
});
function confirmJump() {
  const number = parseInt(jumpPage.value, 10);
  if (!isNaN(number) && number >= 1 && number <= totalPages.value) {
    currentPage.value = number;
  }
  jumpPage.value = '';
  jumping.value = false;
}

const animateCart = ref(false);
function flashCartAnimation() {
  animateCart.value = false;
  requestAnimationFrame(() => {
    animateCart.value = true;
    setTimeout(() => {
      animateCart.value = false;
    }, 500);
  });
}
</script>
<template>
    <iframe id="hiddenForm" style="display:none;" width="0" height="0"></iframe>
    <head>
        <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
    </head>
    <div class="page-wrapper">
        <div class="header-wrapper">
            <header class="header-container">
                <div class="header-brand">
                    <img src= "/src/assets/Logo.webp" loading="eager" class="company-logo" alt="Logo">
                    <h3 class="company-name hide-on-small"> Anugerah Jaya</h3>
                </div>
                
                <div class="search-cart-container">
                    <div class="search-cart ">
                        <input
                            v-model="searchQuery"
                            type="text"
                            placeholder="Cari barang..."
                            class="search-input"
                        />
                    </div>
                    <div class="keranjang" :class="{ 'cart-animate': animateCart }" @click="keranjang.length !== 0 && (showKeranjang = true)">
                        <h5 v-if="totalJumlah > 0"> {{ totalJumlah }}</h5>
                        <img src="/src/assets/shopping-cart.svg" loading="eager" alt="keranjang">    
                    </div>
                </div>
            </header>
        </div>
        <main class="main-content">
            <div v-if="loading" class="progress-container">
                <div class="progress-bar" :style="{ width: progress + '%' }">
                    <span class="progress-text">Loading...</span>
                </div>
            </div>
            <div v-else class="container">
                <div class="product-grid">
                    <div v-for="(item,index) in paginatedItems" :key="index" class="product-card" :class="{ disabled: item.jumlah == 0 }" @click="openPopup(item,selectedItem, showPopup),showPopup = true">
                        <div class="product-content">
                            <div v-if="item.jumlah == 0" class="ribbon-kosong">Kosong</div>
                            <div v-if="item.diskon" class="diskon-badge">
                                Diskon {{ item.diskon }}
                            </div>
                            <div class="image-wrapper">
                                <img :src="item.gambar[0]" loading="lazy" :alt="item.barang">
                            </div>
                            <p class="product-info">
                                {{ item.barang }} 
                            </p>
                            <div class="harga" v-if="item.diskon ==0">{{ item.harga }}</div>
                            <div class="price-section" v-else>
                                <span class="original-price">{{ item.harga }}</span>
                                <span class="discounted-price">Rp{{ discountedPrice(item.harga,item.diskon) }}</span>
                            </div>
                        </div>
                        <div>
                            <div v-if="!keranjang.find(k => k.barang === item.barang)" class="cart-button">
                                <button @click.stop="masukanbarang(item.barang, item.harga, item.gambar, item.diskon, keranjang), flashCartAnimation()" class="cart-button-text">Masukan Keranjang</button>
                            </div>
                            <div v-else class="container-button">
                                <div @click.stop="subtrack(item.barang, keranjang)" class="button"><h5>-</h5></div>

                                <div class="button cursor-default"><h5>{{ keranjang.find(k => k.barang === item.barang)?.jumlah }}</h5></div>

                                <div class="button" :class="{ disabled: keranjang.find(k => k.barang === item.barang)?.jumlah >= item.jumlah}" @click.stop="add(item.barang, keranjang)"><h5>+</h5></div>
                            </div>
                        </div>
                    </div>
                </div>  
            </div>
            <transition name="fade-zoom">
                <div v-if="showPopup && selectedItem" class="modal-overlay" @click="showPopup = false, currentImageIndex = 0">
                    <div class="modal-content" @click.stop>
                        <button class="close-button" @click="showPopup=false">✖</button>

                                    
                    <div class="slider" @touchstart="startTouch" @touchend="endTouch">
                        <Transition :name="slideDirection === 'next' ? 'slide-left' : 'slide-right'" mode="out-in">
                            <img :key="currentImageIndex" :src="selectedItem.value.gambar[currentImageIndex]" loading="lazy" class="slider-image" />
                        </Transition>
                        <div @click="prevImage" class="slider-overlay left">
                            <span class="slider-arrow">‹</span>
                        </div>

                        <div @click="nextImage" class="slider-overlay right">
                            <span class="slider-arrow">›</span>
                        </div>
                    </div>        
                        <h2>{{ selectedItem.value.barang }}</h2>
                        <p>{{ selectedItem.value.keterangan }}</p>
                    <div class="harga" v-if=" selectedItem.value.diskon ==0">{{ selectedItem.value.harga }}</div>
                        <div class="price-section" v-else>
                            <span class="original-price">{{  selectedItem.value.harga }}</span>
                            <span class="discounted-price">Rp{{ discountedPrice( selectedItem.value.harga, selectedItem.value.diskon) }}</span>
                        </div>
                    <div v-if="!keranjang.find(k => k.barang === selectedItem.value.barang)" @click="masukanbarang(selectedItem.value.barang, selectedItem.value.harga, selectedItem.value.gambar, selectedItem.value.diskon, keranjang), flashCartAnimation()" class="cart-button">
                        <h6 class="cart-button-text">Masukan Keranjang</h6>
                    </div>

                    <div
                        v-else
                        class="container-button"
                    >
                        <div @click="subtrack(selectedItem.value.barang, keranjang)" class="button">
                            <h5>-</h5>
                        </div>
                        <div class="button cursor-default">
                            <h5>{{ keranjang.find(k => k.barang === selectedItem.value.barang)?.jumlah || 0 }}</h5>
                        </div>
                        <div  class="button" :class="{disabled: keranjang.find(k => k.barang === selectedItem.value.barang)?.jumlah >= selectedItem.value.jumlah}" @click="add(selectedItem.value.barang, keranjang)">
                            <h5>+</h5>
                        </div>
                    </div>
                </div>
            </div>
            </transition>  
            <div class="pagination">
                <button @click="currentPage--" :disabled="currentPage === 1"><</button>

                <template v-for="(page, index) in paginationRange" :key="index">
                    <button
                    v-if="page !== '...'"
                    @click="currentPage = page"
                    :class="{ active: page === currentPage }"
                    >
                    {{ page }}
                    </button>

                    <div v-else >
                        <template v-if="jumping">
                            <input
                            v-model="jumpPage"
                            type="number"
                            min="1"
                            :max="totalPages"
                            @keydown.enter="confirmJump"
                            placeholder="Page"
                            />
                        </template>
                        <button v-else @click="jumping = true">...</button>
                    </div >
                </template>

                <button @click="currentPage++" :disabled="currentPage === totalPages">></button>
            </div>

            <transition name="fade-zoom">
                <div class="modal-backdrop" v-if="showKeranjang && keranjang.length >0" @click="showKeranjang= false">
                    <div class="modal-contents" v-if="selectedItem" @click.stop>
                    
                        <div class="modal-header">
                            <button @click="showKeranjang = false" class="back-button">←</button>
                            <h2>Pengiriman</h2>
                        </div>

                        <div class="form-section">
                            <label>Nama</label>
                            <input v-model="form.nama" placeholder="Nama lengkap" required/>
                            <p v-if="showErrors && !form.nama" class="error-msg">Nama harus diisi</p>
                            <label>Alamat</label>
                            <textarea v-model="form.alamat" placeholder="Alamat lengkap" required></textarea>
                            <p v-if="showErrors && !form.alamat" class="error-msg">Alamat harus diisi</p>
                            <label>Kelurahan</label>
                            <input v-model="form.kelurahan" placeholder="Kelurahan" required/>
                            <p v-if="showErrors && !form.kelurahan" class="error-msg">Kelurahan harus diisi</p>
                            <label>Kecamatan</label>
                            <input v-model="form.kecamatan" placeholder="Kecamatan" required/>
                            <p v-if="showErrors && !form.kecamatan" class="error-msg">Kecamatan harus diisi</p>
                            <label>Kota</label>
                            <input v-model="form.kota" placeholder="Kota / Kabupaten" required />
                            <p v-if="showErrors && !form.kota" class="error-msg">Kota harus diisi</p>
                            <label>Kode Pos</label>
                            <input v-model="form.kodepos" placeholder="Kode Pos (optional)" />
                        </div>

                        <div class="cart-section" v-for="(item, i) in keranjang" :key="i">
                            <div class="cart-item">
                                <img :src="item.gambar[0]" alt="item.barang" loading="lazy" class="cart-image" />

                                <div class="cart-info-row">
                                    <div class="item-details">
                                        <p class="item-name"><strong>{{ item.barang }}</strong></p>
                                        <p class="item-price">{{item.hargaAsli }}</p>
                                    </div>
                                    <div class="quantity-controls">
                                        <button @click="subtrack(item.barang, keranjang)" >−</button>
                                        <span>{{ item.jumlah }}</span>
                                        <button @click="add(item.barang, keranjang)" >+</button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="summary">
                            <p>Total Barang: {{ totalJumlah }}</p>
                            <p>Total Harga: Rp{{ totalHarga }}</p>
                        </div>
                            <button class="pay-button" @click="submitForm">Kirim</button>
                    </div>
                </div>
            </transition>
        </main>
    </div>
    <footer>
        <transition name="fade-bottom">
            <div class="footer">
                <img src="/src/assets/toko.webp" alt="Background" loading="lazy" class="footer-background"/>
                <h3> MELAYANI PENGIRIMAN DAERAH SURAKARTA !</h3>
                <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d247.20928705844014!2d110.8409321674591!3d-7.536907099999996!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e7a16c57b248aff%3A0x60fe3b1d749968d4!2sToko%20Mucharom%20Jaya!5e0!3m2!1sen!2sid!4v1742816760679!5m2!1sen!2sid" title="Lokasi Toko" width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
            </div>
        </transition>
    </footer>
    
</template>

