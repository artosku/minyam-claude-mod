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

2. Buka Claude Code. Pakai tampilan biasa, jangan ketik `/tui fullscreen`. Kalau sebelumnya kamu pernah menyalakan fullscreen, ketik `/tui default`.

3. Selesai. Minyam muncul sebagai blok besar selebar layar, tepat di atas kotak ketik (mode teater). Ini tampilan utamanya.

## Kalau Minyam belum muncul

- Pastikan kamu tidak sedang di fullscreen. Mode teater tidak jalan di `/tui fullscreen`. Ketik `/tui default`.
- Lebarkan jendela terminal. Layout dua kolom (panggung di kiri, bar di kanan) butuh lebar sekitar 80 karakter ke atas.
- Ketik `/minyam` dua kali (sembunyikan lalu munculkan lagi).
- Tutup Claude Code, lalu buka lagi di folder yang sama.
- Di mode teater, Minyam tampil sebagai blok tinggi selebar layar. Tanah panggung dan bar mengikuti lebar jendela, dan gelembung ucapan tetap selebar paling banyak 54 karakter dengan tinggi yang selalu sama (4 baris).

### Mau versi kecil di samping layar?

Mode teater adalah bawaannya. Kalau kamu lebih suka Minyam kecil yang menempel di sisi kanan layar:

1. Ketik `/tui fullscreen` (terminal perlu selebar sekitar 110 karakter).
2. Ketik `/minyam kecil`.

Kembali ke teater: ketik `/tui default`, lalu `/minyam on`.

## Apa saja yang kamu lihat

- **Tiga bar (di atas, atau di kanan pada mode teater yang lebar):** sisa tenaga, seperti di game. Di mode teater, panggung ada di kiri, bar HP/MP/SP dan lembar status ada di kanan, dan keterangan tiap bar jadi satu baris.
  - **HP** = sisa ruang percakapan (konteks). Bagian bar di kiri tanda `┃` berwarna putih seperti perisai: ruang itu tidak akan terpakai karena Claude Code meringkas percakapan otomatis (auto-compact) sebelum sampai ke sana. Bagian hijau di kanan `┃` adalah yang masih bisa dipakai, dan tulisan `auto compact di N%` menyebut di persen berapa itu terjadi. Kalau auto-compact mati, tandanya tidak muncul.
  - **MP** = sisa jatah 5 jam.
  - **SP** = sisa jatah seminggu.
  - Di bawah tiap bar tertulis berapa persen yang sudah terpakai.
- **Gelembung ucapan:** tulisan apa yang sedang dikerjakan Claude, atau "Lagi diem".
- **Pertarungan:** saat Claude bekerja, Minyam berjalan, ketemu monster, lalu menebasnya. Makin lama Claude bekerja, makin besar monsternya dan makin banyak jurus Minyam. Satu monster kalah setiap satu tugas selesai. Setelah monster terakhir kalah, tulisan **BERES!** dari piksel besar muncul di panggung sampai tugas berikutnya dimulai.
- **Mode GitHub:** kalau Claude menjalankan `git push`, `git pull`, `git fetch`, `git clone`, `git merge`, atau perintah `gh` (PR, issue, dan sebagainya), monsternya berganti jadi gurita yang bentuknya beda di tiap tahap (Anak Gurita yang imut, Gurita Kode berwarna biru dengan antena, Gurita Raksasa berduri dan bertaring, Kraken Merge merah dengan mahkota dan simbol merge) dan Minyam menembak dengan pistol, lengkap dengan suara tembakan. Setelah monster itu kalah, adegan kembali normal.
- **Teman bantuan:** kalau Claude memanggil asisten (sub agent), muncul hewan kecil yang ikut menyerang. Haiku = burung hijau, Sonnet = burung hantu biru, Opus = naga ungu. Hewannya pergi saat asistennya selesai.
- **Deretan alat:** menunjukkan alat apa saja yang dipakai Claude, misalnya `2x Bash`.
- **Info sesi:** model yang dipakai, nama folder, akun, cabang git, lama sesi, biaya, dan jumlah pesan.
- **Kotak ketik di bawah (hanya di tampilan fullscreen, saat panel ada di samping):** di mode teater kotak ini tidak ada, ketik di kotak utama Claude Code. Klik kotaknya, ketik pesan, lalu tekan Enter. Pesannya terkirim ke Claude seperti biasa. Perintah `/` yang kamu ketik di sini langsung dijalankan. Kalau ada perintah yang menolak dijalankan dari sini, teksnya dipindahkan ke kotak ketik utama dan kamu tinggal menekan Enter di sana. Melampirkan file (`@`) tetap lewat kotak utama.

## Perintah

Ketik perintah ini di Claude Code:

| Perintah | Gunanya |
| --- | --- |
| `/minyam` | Sembunyikan Minyam, atau munculkan lagi. Saat disembunyikan, efek suara dan musik ikut berhenti, dan menyala lagi saat Minyam dimunculkan |
| `/minyam kecil` | Ukuran panel lebih pendek (default-nya mode teater yang tinggi dan selebar layar) |
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
3. Kamu tidak bisa mengetik perintah `/` di terminal pengguna. Beri tahu pengguna, dalam poin-poin pendek: pakai tampilan biasa (jangan `/tui fullscreen`, karena mode teater tidak jalan di sana; kalau sedang fullscreen, ketik `/tui default`), dan kalau Minyam belum muncul, ketik `/minyam` dua kali atau tutup lalu buka lagi Claude Code. Fullscreen hanya untuk yang mau versi kecil lewat `/minyam kecil`.
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
