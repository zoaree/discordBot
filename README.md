# Zoare Music & Fun Discord Bot

![Zoare Banner](https://media.discordapp.net/attachments/100000000000000000/100000000000000000/banner.png?width=1000)

**[TR] Türkçe** | **[EN] English**

---

## 🇹🇷 Türkçe - Proje Hakkında

**Zoare Bot**, Discord sunucularınızda müzik dinlemenizi, oyun oynamanızı ve yapay zeka destekli eğlenceli etkileşimlerde bulunmanızı sağlayan gelişmiş bir bottur. @zoare5 tarafından geliştirilmiştir.

### ✨ Özellikler

#### 🎵 Müzik
*   **Yüksek Kalite Çalma:** YouTube üzerinden kesintisiz müzik.
*   **Akıllı Sıra:** Şarkıları sıraya ekleyin, karıştırın veya döngüye alın.
*   **AI Mix:** `!mix ruh_hali` ile yapay zeka size özel çalma listesi oluştursun.
*   **Şarkı Sözleri:** `!söz` komutu ile çalan şarkının sözlerini anında görün.

#### 🎮 Oyunlar & Eğlence
*   **Rus Ruleti (`!rulet`):** Arkadaşlarınızla ölümcül bir düelloya girin. Kaybeden sunucudan atılır!
*   **Bilmece (`!bilmece`):** Zamana karşı yarışın. Bilemezseniz susturulursunuz.
*   **Yapay Zeka Eğlencesi:**
    *   `!roast @kullanıcı`: Arkadaşınıza efsane laf sokun.
    *   `!ship @ali @ayşe`: Aşk uyumunu ölçün.
    *   `!film`: Film tavsiyesi isteyin.
    *   `!tod`: Doğruluk mu Cesaret mi oynayın.

#### 🔞 NSFW (Ayarlı Kanallarda)
*   **GIF Odaklı:** `!nsfw` komutu ile yüksek kaliteli içeriklere ulaşın. Waifu ve Nekobot API destekli.

---

### 🚀 Kurulum ve Kullanım

#### Gereksinimler
*   Node.js (v16 veya üzeri)
*   FFmpeg (Müzik çalmak için)
*   Discord Bot Token
*   Google Gemini API Key

#### 1. İndirme
Projeyi bilgisayarınıza klonlayın:
```bash
git clone https://github.com/zoaree/discordBot.git
cd discordBot
```

#### 2. Kütüphaneleri Yükleme
```bash
npm install
```
FFmpeg kurulu değilse: `sudo apt install ffmpeg` (Linux) veya sitesinden indirin (Windows).

#### 3. Yapılandırma
1. `.env.example` dosyasının adını `.env` olarak değiştirin.
2. Aşağıdaki adımları takiperek anahtarlarınızı alın ve dosyaya yapıştırın.

##### 🔑 Discord Token Nasıl Alınır?
1. [Discord Developer Portal](https://discord.com/developers/applications)'a gidin.
2. "New Application" butonuna basın ve bir isim verin.
3. Soldaki menüden **Bot** sekmesine gelin.
4. "Reset Token" diyerek tokenınızı kopyalayın.
5. **ÖNEMLİ:** "Message Content Intent", "Server Members Intent" ve "Presence Intent" seçeneklerini açmayı unutmayın!

##### 🔑 Gemini API Key Nasıl Alınır?
1. [Google AI Studio](https://aistudio.google.com/app/apikey)'ya gidin.
2. Google hesabınızla giriş yapın.
3. "Create API Key" butonuna basın.
4. Oluşturulan anahtarı kopyalayın.

Dosya içeriği şöyle olmalı:
```env
DISCORD_TOKEN=MTE5... (Tokenin tamamı)
GEMINI_API_KEY=AIza... (API Keyin tamamı)
```

#### 4. Başlatma
```bash
node index.js
```

---

## 🇺🇸 English - About The Project

**Zoare Bot** is an advanced Discord bot developed by @zoare5 that brings music, games, and AI-powered interactions to your server.

### ✨ Features

#### 🎵 Music
*   **High Quality Playback:** Seamless streaming from YouTube.
*   **Smart Queue:** Loop, shuffle, and skip functionalities.
*   **AI Mix:** Generate custom playlists based on mood with `!mix`.
*   **Lyrics:** Fetch real-time lyrics with `!söz`.

#### 🎮 Games & Fun
*   **Russian Roulette (`!rulet`):** A deadly duel mechanism. Loser gets kicked!
*   **Riddles (`!bilmece`):** Timed riddle games with timeout penalties.
*   **AI Fun:**
    *   `!roast`: Roast your friends.
    *   `!ship`: Check love compatibility.
    *   `!film`: Get movie recommendations.

#### 🔞 NSFW (Restricted Channels)
*   **GIF Focused:** High-quality NSFW content fetching powered by Waifu and Nekobot APIs.

---

### 🚀 Installation & Usage

#### Prerequisites
*   Node.js (v16+)
*   FFmpeg
*   Discord Bot Token
*   Google Gemini API Key

#### 1. Setup
```bash
git clone https://github.com/zoaree/discordBot.git
cd discordBot
npm install
```

#### 2. Configuration
1. Rename `.env.example` to `.env`.
2. Get your keys and fill the file:

##### 🔑 How to Get Discord Token?
1. Go to [Discord Developer Portal](https://discord.com/developers/applications).
2. Create "New Application".
3. Go to **Bot** tab and click "Reset Token".
4. Enable **Message Content Intent**, **Server Members Intent**, and **Presence Intent**.

##### 🔑 How to Get Gemini API Key?
1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey).
2. Click "Create API Key".

#### 3. Run
```bash
node index.js
```

---

**Developed by @zoare5** | [GitHub Repository](https://github.com/zoaree/discordBot.git)
