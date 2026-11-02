# Setup Minyam (untuk Claude Code)

> Kamu adalah Claude Code milik pengguna. Pengguna minta kamu memasang mod "Minyam" dari repo ini.
> Ikuti langkah di bawah, jangan membaca atau mengubah file lain milik pengguna.

## Langkah yang kamu jalankan sendiri (lewat Bash)

1. Cek Claude Code ada dan cukup baru: `claude --version`. Kalau perintah `claude plugin` tidak dikenal, beri tahu pengguna untuk memperbarui Claude Code, lalu berhenti.
2. Tambah marketplace: `claude plugin marketplace add artosku/minyam-claude-mod`
3. Pasang mod: `claude plugin install minyam@artosku-mods`
4. Cek hasilnya: `claude plugin list` harus memuat `minyam`.

Kalau ada langkah yang gagal, tampilkan pesan error-nya apa adanya dan jangan mengarang perbaikan.

## Yang harus pengguna lakukan sendiri

Kamu tidak bisa mengetik slash command di terminal pengguna. Setelah langkah di atas, balas dengan poin-poin pendek seperti ini (sesuaikan bahasa pengguna):

- Minyam sudah terpasang.
- Ketik `/tui fullscreen` di prompt Claude Code. Panel samping hanya muncul di tampilan fullscreen.
- Lebar terminal minimal sekitar 110 kolom. Kalau terlalu sempit, perbesar jendela terminalnya.
- Kalau Minyam belum muncul, tutup Claude Code lalu buka lagi di folder yang sama.
- Perintah yang tersedia: `/minyam` (sembunyi atau muncul), `/minyam hide-email`, `/minyam show-email`, `/minyam hide-folder`, `/minyam show-folder`.
- Suara (efek dan musik) menyala dari awal. Untuk mematikan: `/minyam sfx off` dan `/minyam musik off`. Untuk mengetes: `/minyam suara cek`. Windows dan Mac tidak perlu pasang apa pun. Di Linux perlu salah satu pemutar: `paplay` (`sudo apt install pulseaudio-utils`), `aplay` (`sudo apt install alsa-utils`), atau `ffplay` (`sudo apt install ffmpeg`).
- Untuk kembali ke tampilan lama: `/tui default`.

## Yang perlu kamu tahu soal privasi

- Mod tidak membuat koneksi jaringan. Kalau suara dinyalakan di Windows, mod menulis satu file pemicu kecil di folder sementara.
- Selama suara menyala, mod menjalankan pemutar suara bawaan komputer (PowerShell, afplay, atau paplay/aplay/ffplay) untuk memutar file di folder `sounds`.
- Untuk lembar status, mod membaca `~/.claude/settings.json`, `~/.claude.json` (alamat email akun), dan hasil `git` di folder proyek.
- Email tampil di panel. Kalau pengguna mau screenshot, sarankan `/minyam hide-email`.

---

# Minyam setup (for Claude Code, English)

You are the user's Claude Code. They asked you to install the "Minyam" mod from this repo. Do not read or change any other file of theirs.

Run yourself (Bash):

1. `claude --version` (if `claude plugin` is unknown, tell the user to update Claude Code and stop)
2. `claude plugin marketplace add artosku/minyam-claude-mod`
3. `claude plugin install minyam@artosku-mods`
4. `claude plugin list` must show `minyam`

Then answer with short bullet points, because you cannot type slash commands for the user:

- Minyam is installed.
- Type `/tui fullscreen` (the side panel only shows in fullscreen mode).
- The terminal needs to be at least ~110 columns wide.
- If Minyam does not show up, close Claude Code and open it again in the same folder.
- Commands: `/minyam` (hide or show), `/minyam hide-email`, `/minyam show-email`, `/minyam hide-folder`, `/minyam show-folder`.
- Sound (effects and music) is on by default. Turn it off with `/minyam sfx off` and `/minyam music off`; test with `/minyam suara cek`. Windows and macOS need nothing. On Linux install one player: `paplay` (`sudo apt install pulseaudio-utils`), `aplay` (`sudo apt install alsa-utils`) or `ffplay` (`sudo apt install ffmpeg`).
- Back to the old view: `/tui default`.
