# Minyam untuk Claude Code

Minyam, maskot ayam Artosku, jadi HUD bergaya game di terminal Claude Code kamu. Dia duduk di panel samping, menunjukkan sisa konteks dan batas pemakaian sebagai bar HP/MP/SP, dan bubble chat-nya bilang apa yang lagi Claude kerjakan.

*Minyam, the Artosku chicken mascot, as a game-style HUD for Claude Code: HP/MP/SP gauges, a speech bubble for what Claude is doing, an equipment bar of the tools it used, and a status sheet.*

## Isinya

- **Bar HP / MP / SP** (sisa konteks, sisa batas 5 jam, sisa batas mingguan). Hijau, biru, oranye, lalu kuning dan merah saat tinggal sedikit. Di sebelah persen sisa ada `pakai N%` supaya mudah dicocokkan dengan status line.
- **Bubble chat** di kiri Minyam: `Lagi kerja` atau `Lagi diem`, dan apa yang sedang dilakukan ("Menjalankan: git status", "Membaca register.tsx", "Mengubah ...").
- **Bar equipment**: slot per tool (Bash, Read, Edit, Write, Grep, Glob, Agent, Web, Lain) dengan jumlah pemakaian dalam satu giliran, misalnya `2x Bash`, `3x Read`. Slot yang sedang dipakai menyala kuning.
- **Lembar status**: `PLAYER` (model dan effort), `ZONE` (folder), `GUILD` (akun), `BRANCH` (git), `LOOT` (commit terakhir), `TIME`, `GOLD` (biaya sesi) dan `XP` (jumlah prompt).
- Minyam besar dari render 3D aslinya, dikecilkan jadi piksel warna. Ukurannya menyesuaikan lebar dan tinggi panel.
- Kalau terminalnya sempit dan tidak ada panel samping, Minyam kecil muncul di atas prompt.

## Pasang

Di prompt Claude Code:

```
/plugin install minyam --marketplace artosku/minyam-claude-mod
```

Jawab `y` untuk menambah marketplace, lalu pilih scope (user paling mudah). Dari shell:

```
claude plugin install minyam --marketplace artosku/minyam-claude-mod
```

Aplikasi desktop: klik `+` di samping kotak prompt, lalu Plugins, Add marketplace dengan `artosku/minyam-claude-mod`, lalu Add plugin. (Panel samping hanya ada di terminal.)

## Supaya Minyam ada di kanan layar

Panel samping hanya muncul di tampilan **fullscreen** Claude Code, dengan lebar terminal minimal sekitar 110 kolom:

```
/tui fullscreen
```

Untuk kembali ke tampilan lama: `/tui default`. Di tampilan klasik, panel muncul sebagai baris di atas prompt, bukan di samping.

## Perintah

| Perintah | Fungsi |
| --- | --- |
| `/minyam` | Sembunyikan atau munculkan Minyam |
| `/minyam on` / `/minyam off` | Paksa muncul / sembunyi |
| `/minyam besar` | Minta panel selebar mungkin (maksimal 45% layar) |

## Yang dibaca dan tidak dikirim ke mana-mana

Mod ini tidak membuat koneksi jaringan dan tidak menulis file. Untuk lembar status, mod membaca di komputer kamu sendiri:

- `~/.claude/settings.json` (level effort) dan `~/.claude.json` (alamat email akun) untuk ditampilkan di baris `PLAYER` dan `GUILD`. Email muncul di layar, jadi hati-hati kalau kamu screenshot.
- Hasil `git` di folder proyek yang sedang dibuka (branch, status, commit terakhir).
- Angka konteks, batas pemakaian dan biaya dari Claude Code sendiri.

## Mengubah tampilan

- Gambar Minyam ada di `hooks/big.ts` (beberapa ukuran) dan `hooks/sprite.ts` (versi kecil di atas prompt). Isinya daftar warna per sel, dua piksel per sel.
- Nama dan warna slot equipment ada di `GEAR` di `hooks/register.tsx`.
- Warna bar dan susunan kartu ada di fungsi render `Pane` di file yang sama.

Mod ini sudah ditulis untuk Claude Code dengan dukungan mod (plugin dengan hooks module). Kalau perintah `/plugin` kamu tidak mengenal mod, perbarui Claude Code dulu.

## Lisensi

Kode: MIT, lihat `LICENSE`. Gambar maskot Minyam adalah milik Artosku; di sini dipakai hanya sebagai data warna sprite untuk mod ini.
