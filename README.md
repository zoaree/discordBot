# 🎵 Zoare - Gelişmiş Discord Müzik & Eğlence Botu

Zoare, **Yapay Zeka (AI)** destekli, sonsuz **Radyo** özellikli ve anlık tepkiler verebilen bir **Soundboard** sistemine sahip gelişmiş bir Discord botudur.

---

## 🚀 Öne Çıkan Özellikler

*   **🎙️ Sonsuz Radyo:** 10 farklı kategoride (Arabesk, Pop, Rock, Rap...) binlerce şarkılık arşiv. Asla durmaz!
*   **🤖 AI DJ:** "Aşk acısı çekiyorum" de, yapay zeka sana özel 30 şarkılık playlist hazırlasın.
*   **🎤 Soundboard:** `!s bruh` yaz, muhabbetin ortasına ses efekti at. `!s de` ile botu konuştur.
*   **🎮 Oyunlar:** Rus Ruleti (`!rulet`) ile kaybedeni sunucudan at, Bilmece çöz.
*   **🔞 NSFW:** Yapay zeka destekli akıllı arama ile gerçek GIF'ler bulur.

---

## 📖 KULLANIM KILAVUZU (Komutlar)

Botun varsayılan öneki (prefix): **`!`**

### 1. 📻 Sonsuz Radyo Modu (`!radyo`)
Bot kendi devasa arşivinden rastgele şarkılar seçer ve çalar. Şarkı bitince otomatik yenisi gelir.
*   `!radyo arabesk` : En damar şarkılar (Müslüm, Ferdi...)
*   `!radyo pop`     : Türkçe Pop Hitler (Tarkan, Hande...)
*   `!radyo rock`    : Duman, Mor ve Ötesi...
*   `!radyo rap`     : Ceza, Sagopa, Ezhel...
*   **Diğerleri:** `ask`, `huzun`, `akustik`, `nostalji`, `yabanci`, `party`
*   `!radyo karisik` : Tüm arşivden rastgele çalar. Her telden!

### 2. 🎤 Soundboard & Konuşma (`!s`)
Sohbet sırasında anlık tepki vermek için kullanılır. Listede **olmayan** bir şey yazarsan, bot YouTube'da **en çok izlenen** kısa videoyu bulup getirir (Dinamik Arama).

*   `!s de <mesaj>` : Bot yazdığını Türkçe okur (TTS). *(Örnek: `!s de Naber müdür`)*
*   `!s naber`   : Aykut Elmas "Naber müdür".
*   `!s gora`    : Arif Işık "Bir cisim yaklaşıyor".
*   `!s recep`   : Recep İvedik gülüşü.
*   `!s <herhangi>` : Aklına geleni yaz, bot bulsun! *(Örnek: `!s osuruk`, `!s windows error`)*
*   `!s list`    : Hazır sesleri gösterir.

### 3. 🎵 Müzik Komutları
*   `!play <şarkı>` : Şarkı açar (YouTube).
*   `!stop` : Botu durdurur ve kanaldan atar.
*   `!skip` : Şarkıyı geçer.
*   `!pause` / `!resume` : Durdur/Devam et.
*   `!loop` : Döngüye alır (Aynı şarkıyı tekrar çalar).
*   `!queue` : Sıradaki şarkıları gösterir.
*   `!soz` : Çalan şarkının sözlerini bulur.

### 4. 🤖 Yapay Zeka (AI)
*   `!mix <ruh hali>` : Ruh haline göre playlist yapar. *(Örnek: `!mix yağmurlu havada kahve keyfi`)*
*   `!film <tür>` : Sana film önerir. *(Örnek: `!film korku`)
*   `!roast @kisi` : Etiketlediğin kişiye yapay zeka ile laf sokar.
*   `!öv @kisi` : Etiketlediğin kişiyi över.
*   `!ship @1 @2` : İki kişi arasındaki aşk uyumunu yorumlar.

### 5. 🔞 NSFW (Yetişkin İçerik)
Sadece NSFW kanallarında çalışır. **Hibrit Sistem (Nekobot + Reddit)** kullanır.
*   `!nsfw <kelime>` : İstediğini ara. *(Örnek: `!nsfw lesbian`, `!nsfw blowjob`, `!nsfw feet`)*
*   **Gif Öncelikli:** Bot her zaman **gerçek GIF** (.gif/.mp4) bulmaya çalışır. Video linki atmaz, direkt oynatır.
*   **Derin Karıştırma:** Her seferinde farklı kaynaklardan (Hot, New, Top) içerik çeker. Asla aynı şeyi görmezsin.
*   **Kategoriler:** `ass`, `boobs`, `pussy`, `anal`, `blowjob`, `thighs`, `feet`, `couple`, `gonewild`...
*   **Akıllı Fallback:** Nekobot çalışmazsa saniyesinde Reddit arşivini tarar ve sonucu getirir.

### 6. 🎮 Oyunlar
*   `!rulet @kisi` : Rus Ruleti! 1/6 ihtimalle kişi sunucudan atılır (Kick).
*   `!sik` : Rulet tetiğini çeker.
*   `!bilmece` : Bot bir bilmece sorar, bilen kazanır.

---

## 🛠️ Kurulum (Admin İçin)

Bu botu kendi bilgisayarında veya sunucunda barındırmak için:

### Gereksinimler
*   Node.js (v18 veya üstü)
*   FFmpeg (Sistemde kurulu olmalı)
*   Bir Discord Bot Tokeni
*   Gemini API Key (Google AI Studio'dan ücretsiz alınır)

### Adım 1: Dosyaları İndir
Projeyi klasöre çıkartın.

### Adım 2: Ayarları Yapın
`.env.example` dosyasının adını `.env` yapın ve içini doldurun:
```env
DISCORD_TOKEN=senin_bot_tokenin
GEMINI_API_KEY=senin_gemini_api_keyin
```

### Adım 3: Yükle ve Başlat
Terminali açın ve şu komutları girin:
```bash
# Gerekli paketleri yükle
npm install

# Botu başlat
node index.js
```

### 🛑 7/24 Çalıştırma (Linux/Systemd)
Eğer Linux kullanıyorsan ve botun hep açık kalmasını istiyorsan:
1. `setup_service.sh` dosyasını çalıştır:
   ```bash
   chmod +x setup_service.sh
   ./setup_service.sh
   ```
2. Bu işlem botu arka planda servis olarak başlatır.

---
*Geliştirici: Kadiroski*
