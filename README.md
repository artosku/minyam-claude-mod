# Minyam untuk Claude Code

Minyam, maskot ayam Artosku, jadi HUD bergaya game di terminal Claude Code kamu: bar HP/MP/SP, pertarungan saat Claude bekerja, pet untuk sub agent, dan kotak ketik.

*Minyam, the Artosku chicken mascot, as a game-style HUD for Claude Code: HP/MP/SP bars, a fight scene while Claude works, pets for sub agents, and a typing box.*

## Pasang (3 langkah)

**Cara paling mudah:** buka Claude Code, lalu tulis:

```
setup https://github.com/artosku/minyam-claude-mod
```

Claude akan memasang mod sendiri, lalu memberi daftar langkah yang harus kamu ketik sendiri.

**Atau manual**, dari shell:

```
claude plugin marketplace add artosku/minyam-claude-mod
claude plugin install minyam@artosku-mods
```

Lalu di Claude Code ketik:

```
/tui fullscreen
```

Selesai. Panel Minyam muncul di kanan layar. Syaratnya: tampilan fullscreen dan lebar terminal minimal sekitar 110 kolom. Kalau belum muncul, tutup Claude Code lalu buka lagi di folder yang sama. Untuk kembali ke tampilan lama: `/tui default`.

## Untuk AI agent (Claude Code) yang diminta memasang ini

1. Jalankan lewat Bash: `claude plugin marketplace add artosku/minyam-claude-mod`, lalu `claude plugin install minyam@artosku-mods`, lalu `claude plugin list` (harus memuat `minyam`).
2. Jangan membaca atau mengubah file lain milik pengguna.
3. Kamu tidak bisa mengetik slash command di terminal pengguna. Balas dengan poin-poin pendek yang menyuruh pengguna mengetik `/tui fullscreen`, memastikan terminal minimal 110 kolom, dan menutup lalu membuka lagi Claude Code kalau Minyam belum muncul.
4. Rincian lengkap dan versi Inggris: [`SETUP_UNTUK_CLAUDE.md`](SETUP_UNTUK_CLAUDE.md).

## Isinya

- **Bar HP / MP / SP:** sisa konteks, sisa batas 5 jam, sisa batas mingguan. Di bawah tiap bar ada `terpakai N%` dan keterangannya.
- **Pertarungan:** saat Claude bekerja, Minyam berjalan, bertemu musuh, lalu menebas terus. Ada combo, skill (Tebasan Silang, Gelombang Angin), ultimate (Meteor Emas), dan musuh yang berevolusi makin besar (Slime, Slime Tanduk, Ogre, Naga). Satu musuh tumbang tiap task selesai.
- **Pet sub agent:** saat Claude memanggil sub agent, pet muncul dan ikut menyerang: Haiku (burung hijau), Sonnet (burung hantu biru), Opus (naga ungu-emas). Pet hilang saat sub agent selesai.
- **Bubble chat** di atas Minyam: apa yang sedang dikerjakan Claude atau `Lagi diem`.
- **Bar equipment:** slot per tool (Bash, Read, Edit, Write, Grep, Glob, Agent, Web, Lain) dengan jumlah pemakaian per giliran, misalnya `2x Bash`.
- **Lembar status:** `PLAYER` (model dan effort), `ZONE` (folder), `GUILD` (akun), `BRANCH` (git), `LOOT` (commit terakhir), `TIME`, `GOLD` (biaya sesi), `XP` (jumlah prompt).
- **Kotak ketik** di bawah panel: klik, ketik, Enter kirim. Teks panjang turun ke baris berikutnya dan terkirim ke sesi seperti prompt biasa. Kursor hanya di ujung teks, tanpa slash command dan `@file`; untuk itu pakai prompt asli.

## Perintah

| Perintah | Fungsi |
| --- | --- |
| `/minyam` | Sembunyikan atau munculkan Minyam |
| `/minyam on` / `/minyam off` | Paksa muncul / sembunyi |
| `/minyam hide-email` | Sembunyikan nama email (jadi `******@gmail.com`) |
| `/minyam show-email` | Tampilkan email lagi |
| `/minyam hide-folder` | Sembunyikan nama folder (ZONE) jadi `******` |
| `/minyam show-folder` | Tampilkan nama folder lagi |

Pakai `hide-email` dan `hide-folder` sebelum screenshot.

## Masalah umum

- **Panel tidak muncul:** pastikan sudah `/tui fullscreen`, terminal minimal 110 kolom, lalu tutup dan buka lagi Claude Code.
- **Panel terlalu lebar atau sempit:** geser pemisah antara log dan panel dengan mouse. Isi panel dibatasi 54 kolom.
- **Perintah `claude plugin` tidak dikenal:** perbarui Claude Code dulu. Mod ini butuh versi yang mendukung mod (plugin dengan hooks module).
- **Di tampilan klasik** (bukan fullscreen), Minyam kecil dan bubble muncul sebagai baris di atas prompt.

## Yang dibaca, dan tidak dikirim ke mana-mana

Mod ini tidak membuat koneksi jaringan dan tidak menulis file. Untuk lembar status, mod membaca di komputer kamu sendiri:

- `~/.claude/settings.json` (level effort) dan `~/.claude.json` (alamat email akun) untuk baris `PLAYER` dan `GUILD`. Email tampil di layar.
- Hasil `git` di folder proyek yang sedang dibuka (branch, status, commit terakhir).
- Angka konteks, batas pemakaian, dan biaya dari Claude Code sendiri.
- Teks yang kamu ketik di kotak ketik dikirim ke sesi Claude kamu, sama seperti prompt biasa.

## Mengubah tampilan

- Gambar Minyam, musuh, dan pet ada di `hooks/scene.ts`. `hooks/sprite.ts` adalah Minyam kecil di atas prompt.
- Kotak ketik ada di `hooks/chat.tsx`.
- Nama dan ikon slot equipment ada di `GEAR` di `hooks/register.tsx`. Warna bar dan susunan panel ada di fungsi render `Pane` di file yang sama.

## Tentang Artosku

Minyam adalah maskot aplikasi **Artosku - Pencatatan Keuanganmu**, aplikasi pencatat keuangan untuk Android. Kalau mau mencoba aplikasinya, unduh di Google Play:

[Artosku - Pencatatan Keuanganmu di Google Play](https://play.google.com/store/apps/details?id=com.artosku)

## Lisensi

Kode: MIT, lihat `LICENSE`. Gambar maskot Minyam adalah milik Artosku.
