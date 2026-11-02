# Minyam untuk Claude Code

Minyam adalah ayam kecil yang tinggal di layar Claude Code kamu.

Dia menunjukkan Claude lagi ngapain, sisa jatah pemakaianmu, dan bertarung melawan monster saat Claude bekerja.

*Minyam is a small chicken that lives on your Claude Code screen. It shows what Claude is doing, how much of your usage is left, and fights monsters while Claude works.*

## Cara pasang

Ada dua cara. Pilih satu.

### Cara 1: minta Claude yang memasang (paling gampang)

Buka Claude Code, lalu ketik pesan ini:

```
setup https://github.com/artosku/minyam-claude-mod
```

Claude akan memasangnya sendiri. Setelah itu dia akan memberi tahu apa yang perlu kamu ketik.

### Cara 2: pasang sendiri

1. Buka terminal biasa (bukan Claude Code), lalu jalankan dua baris ini satu per satu:

   ```
   claude plugin marketplace add artosku/minyam-claude-mod
   claude plugin install minyam@artosku-mods
   ```

2. Buka Claude Code, lalu ketik:

   ```
   /tui fullscreen
   ```

3. Selesai. Minyam muncul di sisi kanan layar.

## Kalau Minyam belum muncul

- Pastikan kamu sudah mengetik `/tui fullscreen`.
- Lebarkan jendela terminal. Minyam butuh lebar sekitar 110 karakter. Kalau terlalu sempit, dia tidak muncul.
- Tutup Claude Code, lalu buka lagi di folder yang sama.
- Kalau muncul tapi terlalu lebar atau sempit, geser garis pemisah di tengah layar dengan mouse.

Mau kembali ke tampilan biasa? Ketik `/tui default`.

## Apa saja yang kamu lihat

- **Tiga bar di atas:** sisa tenaga, seperti di game.
  - **HP** = sisa ruang percakapan (konteks).
  - **MP** = sisa jatah 5 jam.
  - **SP** = sisa jatah seminggu.
  - Di bawah tiap bar tertulis berapa persen yang sudah terpakai.
- **Gelembung ucapan:** tulisan apa yang sedang dikerjakan Claude, atau "Lagi diem".
- **Pertarungan:** saat Claude bekerja, Minyam berjalan, ketemu monster, lalu menebasnya. Makin lama Claude bekerja, makin besar monsternya dan makin banyak jurus Minyam. Satu monster kalah setiap satu tugas selesai. Setelah monster terakhir kalah, tulisan **BERES!** dari piksel besar muncul di panggung sampai tugas berikutnya dimulai.
- **Mode GitHub:** kalau Claude menjalankan `git push`, `git pull`, `git fetch`, `git clone`, `git merge`, atau perintah `gh` (PR, issue, dan sebagainya), monsternya berganti jadi gurita yang bentuknya beda di tiap tahap (Anak Gurita yang imut, Gurita Kode berwarna biru dengan antena, Gurita Raksasa berduri dan bertaring, Kraken Merge merah dengan mahkota dan simbol merge) dan Minyam menembak dengan pistol, lengkap dengan suara tembakan. Setelah monster itu kalah, adegan kembali normal.
- **Teman bantuan:** kalau Claude memanggil asisten (sub agent), muncul hewan kecil yang ikut menyerang. Haiku = burung hijau, Sonnet = burung hantu biru, Opus = naga ungu. Hewannya pergi saat asistennya selesai.
- **Deretan alat:** menunjukkan alat apa saja yang dipakai Claude, misalnya `2x Bash`.
- **Info sesi:** model yang dipakai, nama folder, akun, cabang git, lama sesi, biaya, dan jumlah pesan.
- **Kotak ketik di bawah:** klik kotaknya, ketik pesan, lalu tekan Enter. Pesannya terkirim ke Claude seperti biasa. Untuk perintah `/` atau melampirkan file, tetap pakai kotak ketik utama Claude Code.

## Perintah

Ketik perintah ini di Claude Code:

| Perintah | Gunanya |
| --- | --- |
| `/minyam` | Sembunyikan Minyam, atau munculkan lagi |
| `/minyam hide-email` | Sembunyikan email kamu di layar (tampil `******@gmail.com`) |
| `/minyam show-email` | Tampilkan email lagi |
| `/minyam hide-folder` | Sembunyikan nama folder (tampil `******`) |
| `/minyam show-folder` | Tampilkan nama folder lagi |
| `/minyam sfx off` / `/minyam sfx on` | Matikan atau nyalakan efek suara |
| `/minyam musik off` / `/minyam musik on` | Matikan atau nyalakan musik petualangan |
| `/minyam suara cek` | Bunyikan satu suara dan cek apakah komputermu bisa memutar suara |

Mau screenshot layar? Jalankan `hide-email` dan `hide-folder` dulu supaya data pribadimu tidak ikut terlihat.

## Suara (awalnya menyala)

Minyam punya efek suara (setiap tebasan, jurus, ultimate, monster kalah, hewan bantuan datang, tugas selesai) dan musik petualangan. **Dua-duanya menyala dari awal.** Kalau mau mematikan:

```
/minyam sfx off
/minyam musik off
```

Pilihanmu tersimpan, jadi tidak perlu diulang.

Suaranya diputar dengan pemutar yang sudah ada di komputermu. Ketik `/minyam suara cek` untuk mengetes. Kalau ada bunyi, berarti beres. Kalau tidak ada bunyi sama sekali, lihat tabel di bawah.

| Komputer | Perlu dipasang? |
| --- | --- |
| **Windows** | Tidak. Memakai PowerShell bawaan. |
| **Mac** | Tidak. Memakai `afplay` bawaan. |
| **Linux** | Perlu satu pemutar. Pasang salah satu: `sudo apt install pulseaudio-utils`, atau `sudo apt install alsa-utils`, atau `sudo apt install ffmpeg`. Distro lain: pasang paket yang berisi `paplay`, `aplay`, atau `ffplay`. |

Di Linux tanpa pemutar, Minyam diam saja sampai kamu memasangnya. Kalau `/minyam suara cek` bilang belum ada pemutar, ikuti petunjuk yang muncul di pesannya.

Catatan: saat suara menyala, Minyam menjalankan program pemutar di komputermu (PowerShell di Windows). Di Windows, Minyam juga membuat satu file kecil di folder sementara (`minyam-sfx-...txt`) sebagai pemicu suara. Musik berjalan sebagai satu proses kecil di latar dan berhenti saat kamu mengetik `/minyam musik off`.

## Soal privasi

- Minyam tidak memakai internet.
- Kalau kamu menyalakan suara, Minyam menjalankan pemutar suara bawaan komputermu untuk memutar file di folder `sounds`. Di Windows ada satu file pemicu kecil di folder sementara. Hanya itu.
- Dia hanya membaca data dari komputermu sendiri: pengaturan Claude Code, email akun Claude (untuk ditampilkan di layar), dan info git di folder yang sedang kamu buka.
- Pesan yang kamu ketik di kotak ketik Minyam dikirim ke Claude kamu, sama seperti pesan biasa.

## Untuk AI agent yang diminta memasang ini

1. Jalankan lewat Bash: `claude plugin marketplace add artosku/minyam-claude-mod`, lalu `claude plugin install minyam@artosku-mods`, lalu `claude plugin list` (harus ada `minyam`).
2. Jangan membaca atau mengubah file lain milik pengguna.
3. Kamu tidak bisa mengetik perintah `/` di terminal pengguna. Beri tahu pengguna, dalam poin-poin pendek: ketik `/tui fullscreen`, lebarkan terminal sampai sekitar 110 karakter, dan kalau Minyam belum muncul, tutup lalu buka lagi Claude Code.
4. Rincian lengkap: [`SETUP_UNTUK_CLAUDE.md`](SETUP_UNTUK_CLAUDE.md).

## Untuk yang mau mengubah tampilan

- Gambar Minyam, monster, dan hewan bantuan: `hooks/scene.ts`.
- Kotak ketik: `hooks/chat.tsx`. Suara: `hooks/sound.ts` dan folder `sounds`.
- Bar, warna, dan susunan panel: `hooks/register.tsx`.

## Tentang Artosku

Minyam adalah maskot aplikasi **Artosku - Pencatatan Keuanganmu**, aplikasi pencatat keuangan untuk Android. Kalau mau mencoba aplikasinya, unduh di Google Play:

[Artosku - Pencatatan Keuanganmu di Google Play](https://play.google.com/store/apps/details?id=com.artosku)

## Lisensi

Kode: MIT (boleh dipakai dan diubah), lihat file `LICENSE`. Gambar maskot Minyam adalah milik Artosku.
