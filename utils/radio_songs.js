const arabesk = [
    // MÜSLÜM GÜRSES (Baba)
    "Müslüm Gürses - Affet", "Müslüm Gürses - Seni Yazdım Kalbime", "Müslüm Gürses - Kaç Kadeh Kırıldı", "Müslüm Gürses - Nilüfer", "Müslüm Gürses - Bir Bilebilsen",
    "Müslüm Gürses - Adını Sen Koy", "Müslüm Gürses - Hasret Rüzgarları", "Müslüm Gürses - Sigara", "Müslüm Gürses - İtirazım Var", "Müslüm Gürses - Tanrı İstemezse",
    "Müslüm Gürses - Unutamadım", "Müslüm Gürses - Yıllar Utansın", "Müslüm Gürses - Senden Vazgeçmem", "Müslüm Gürses - Evlat", "Müslüm Gürses - Hangimiz Sevmedik",
    "Müslüm Gürses - Paramparça", "Müslüm Gürses - Sensiz Olmaz", "Müslüm Gürses - Bir Şişe Şarap", "Müslüm Gürses - Gönül Teknem", "Müslüm Gürses - Aldanma Çocuksu Mahsun Yüzüne",
    "Müslüm Gürses - Güldür Yüzümü", "Müslüm Gürses - Benim Meselem", "Müslüm Gürses - Usta", "Müslüm Gürses - Yıkıla Yıkıla", "Müslüm Gürses - Küskünüm",
    "Müslüm Gürses - Seni Yazdım Kalbime", "Müslüm Gürses - Sebepsiz Ayrılık", "Müslüm Gürses - İsyankar", "Müslüm Gürses - Canım Dediklerim", "Müslüm Gürses - Biz Babadan Böyle Gördük",
    // FERDİ TAYFUR (Kral)
    "Ferdi Tayfur - Hatıran Yeter", "Ferdi Tayfur - Ben de Özledim", "Ferdi Tayfur - Emmoğlu", "Ferdi Tayfur - Çeşme", "Ferdi Tayfur - Merak Etme Sen",
    "Ferdi Tayfur - Huzurum Kalmadı", "Ferdi Tayfur - Bana Sor", "Ferdi Tayfur - Derbeder", "Ferdi Tayfur - Akşam Güneşi", "Ferdi Tayfur - İçim Yanar",
    "Ferdi Tayfur - Yaktı Beni", "Ferdi Tayfur - Durdurun Dünyayı", "Ferdi Tayfur - Sevda Yelleri", "Ferdi Tayfur - Fadime'nin Düğünü", "Ferdi Tayfur - Geçen Yıl",
    "Ferdi Tayfur - Sabahçı Kahvesi", "Ferdi Tayfur - Kovuldum", "Ferdi Tayfur - Bu Şehrin Geceleri", "Ferdi Tayfur - Ah Bir Çocuk Olsaydım", "Ferdi Tayfur - Sanma Ki Yaşıyorum",
    // İBRAHİM TATLISES (İmparator)
    "İbrahim Tatlıses - Mutlu Ol Yeter", "İbrahim Tatlıses - Yalan", "İbrahim Tatlıses - Bir Kulunu Çok Sevdim", "İbrahim Tatlıses - Bebeğim", "İbrahim Tatlıses - Haydi Söyle",
    "İbrahim Tatlıses - Aramam", "İbrahim Tatlıses - Yalnızım", "İbrahim Tatlıses - Dom Dom Kurşunu", "İbrahim Tatlıses - Mavi Mavi", "İbrahim Tatlıses - Sarhoş",
    "İbrahim Tatlıses - Ağrı Dağın Eteğinde", "İbrahim Tatlıses - Tamam Aşkım", "İbrahim Tatlıses - Gel Gel Gümle Gel", "İbrahim Tatlıses - Şemmame",
    "İbrahim Tatlıses - Hasret Kaldım", "İbrahim Tatlıses - Leylim Ley", "İbrahim Tatlıses - Saçlarını Yol Getir", "İbrahim Tatlıses - Pala Remzi",
    // ORHAN GENCEBAY (Baba)
    "Orhan Gencebay - Batsın Bu Dünya", "Orhan Gencebay - Hatasız Kul Olmaz", "Orhan Gencebay - Bir Teselli Ver", "Orhan Gencebay - Vazgeç Gönlüm", "Orhan Gencebay - Kaderimin Oyunu",
    "Orhan Gencebay - Hor Görme Garibi", "Orhan Gencebay - Akşam Güneşi", "Orhan Gencebay - Dil Yarası", "Orhan Gencebay - Gitti de Gitti", "Orhan Gencebay - Sevenler Mesut Olur",
    "Orhan Gencebay - Yarabbim", "Orhan Gencebay - Çilekeş", "Orhan Gencebay - Dokunma", "Orhan Gencebay - Aşk Pınarı",
    // AZER BÜLBÜL (Tehlike)
    "Azer Bülbül - Duygularım", "Azer Bülbül - Çoğu Gitti Azı Kaldı", "Azer Bülbül - İlle de Sen", "Azer Bülbül - Başaramadım", "Azer Bülbül - Zoruna mı Gitti",
    "Azer Bülbül - Bu Gece Karakolluk Olabilirim", "Azer Bülbül - Caney", "Azer Bülbül - Yatacak Yerin Yok", "Azer Bülbül - Aman Güzel Yavaş Yürü", "Azer Bülbül - Kurşun Yedim",
    "Azer Bülbül - Belaya Düştüm", "Azer Bülbül - Ben Babayım", "Azer Bülbül - Yandım Oy", "Azer Bülbül - Dokunmayın Çok Fenayım",
    // DİĞER EFSANELER
    "Kibariye - Annem", "Kibariye - Dönme Sevgilim", "Kibariye - Tepecikli", "Kibariye - Ah İstanbul",
    "Bergen - Sen Affetsen Ben Affetmem", "Bergen - Benim İçin Üzülme", "Bergen - Elimde Duran Fotoğrafın", "Bergen - Acıların Kadını",
    "Hakan Taşıyan - Güz Gülleri", "Hakan Taşıyan - Hesabım Bitmedi", "Hakan Taşıyan - Sensiz İki Gün",
    "Cengiz Kurtoğlu - Küllenen Aşk", "Cengiz Kurtoğlu - Hain Geceler", "Cengiz Kurtoğlu - Duvardaki Resim", "Cengiz Kurtoğlu - Liselim", "Cengiz Kurtoğlu - Yorgun Yıllarım",
    "Cengiz Kurtoğlu - Unutulan", "Cengiz Kurtoğlu - Gelin Olmuş Gidiyorsun", "Cengiz Kurtoğlu - Gece Olunca", "Cengiz Kurtoğlu - Resmini Öptüm De Yattım",
    "Kamuran Akkor - Bir Ateşe Attın Beni", "Gülden Karaböcek - Dilek Taşı", "Gülden Karaböcek - Sürünüyorum", "Gülden Karaböcek - Kırılsın Ellerim",
    "Ebru Gündeş - Demir Attım Yalnızlığa", "Ebru Gündeş - Fırtınalar", "Ebru Gündeş - Çingenem", "Ebru Gündeş - Araftayım",
    "Sibel Can - Padişah", "Sibel Can - Kış Masalı", "Sibel Can - Lale Devri", "Sibel Can - Çakmak Çakmak",
    "Hüseyin Altın - Dargınım", "Hüseyin Altın - Cennetim Sensin",
    "Güllü - Oyuncak Gibi", "Güllü - Zalim", "Güllü - Değmezmiş Sana"
];

const ask = [
    // SEZEN AKSU
    "Sezen Aksu - Vazgeçtim", "Sezen Aksu - Tükeneceğiz", "Sezen Aksu - Biliyorsun", "Sezen Aksu - Sen Ağlama", "Sezen Aksu - Belalım",
    "Sezen Aksu - Keskin Bıçak", "Sezen Aksu - Git", "Sezen Aksu - Geri Dön", "Sezen Aksu - İstanbul İstanbul Olalı", "Sezen Aksu - Kaybolan Yıllar",
    "Sezen Aksu - Masum Değiliz", "Sezen Aksu - Perişanım Şimdi", "Sezen Aksu - İkinci Bahar", "Sezen Aksu - Küçücüğüm", "Sezen Aksu - Ben Sende Tutuklu Kaldım",
    // YILDIZ TİLBE
    "Yıldız Tilbe - Vazgeçtim", "Yıldız Tilbe - Delikanlım", "Yıldız Tilbe - Emi", "Yıldız Tilbe - Çabuk Olalım Aşkım", "Yıldız Tilbe - Ama Evlisin",
    "Yıldız Tilbe - Aşk Laftan Anlamaz Ki", "Yıldız Tilbe - El Adamı", "Yıldız Tilbe - Ummadığım Anda", "Yıldız Tilbe - Haberi Olsun", "Yıldız Tilbe - Çat Kapı",
    // SERTAB & LEVENT & TARKAN
    "Sertab Erener - Aşk", "Sertab Erener - Vur Yüreğim", "Sertab Erener - Yanarım", "Sertab Erener - Olsun",
    "Levent Yüksel - Zalim", "Levent Yüksel - Kadınım", "Levent Yüksel - Med Cezir", "Levent Yüksel - Bu Gece Son",
    "Tarkan - Kış Güneşi", "Tarkan - Beni Çok Sev", "Tarkan - İnci Tanem", "Tarkan - Unutmamalı", "Tarkan - Gitti Gideli",
    // 90'lar SLOW
    "Kayahan - Bizimkisi Bir Aşk Hikayesi", "Kayahan - Seninle Her Şeye Varım Ben", "Kayahan - Gönül Sayfam", "Kayahan - Odalarda Işıksızım",
    "Nilüfer - Caddelerde Rüzgar", "Nilüfer - Yine Yeni Yeniden", "Nilüfer - Kavak Yelleri", "Nilüfer - Haram Geceler",
    "Zerrin Özer - Kıyamam", "Zerrin Özer - O Yaz", "Zerrin Özer - Gönül",
    "Çelik - Hercai", "Çelik - Ateşteyim", "İzel - Çelik - Ercan - Dönmelisin",
    // 2000'ler SLOW
    "Mustafa Ceceli - Hastalıkta Sağlıkta", "Mustafa Ceceli - Gül Rengi", "Mustafa Ceceli - Sevgilim",
    "Ferhat Göçer - Cennet", "Ferhat Göçer - Yastayım", "Ferhat Göçer - Biri Bana Gelsin",
    "Rafet El Roman - Seni Seviyorum", "Rafet El Roman - Bana Sen Lazımsın", "Rafet El Roman - Sürgün",
    "Yalın - Zalim", "Yalın - Cumhuriyet", "Yalın - Küçücüğüm", "Yalın - Meleklerin Sözü Var",
    "Kenan Doğulu - Kurşun Adres Sormaz Ki", "Kenan Doğulu - Tutamıyorum Zamanı", "Kenan Doğulu - Aşk Oyunu",
    "Gökhan Kırdar - Yerine Sevemem", "Kutsi - İlan-ı Aşk", "Kutsi - Doğum Günü Hediyesi",
    // YENİ NESİL SLOW
    "Teoman - Paramparça", "Teoman - Sevdim Seni Bir Kere", "Teoman - Çoban Yıldızı",
    "Şebnem Ferah - Sil Baştan", "Şebnem Ferah - Yağmurlar", "Şebnem Ferah - Hoşçakal",
    "Model - Değmesin Ellerimiz", "Model - Pembe Mezarlık",
    "Pinhani - Hele Bi Gel", "Pinhani - Ne Güzel Güldün", "Pinhani - Beni Al",
    "Yüzyüzeyken Konuşuruz - Dinle Beni Bi", "Yüzyüzeyken Konuşuruz - Ne Fark Eder", "Yüzyüzeyken Konuşuruz - Boş Gemiler",
    "Madrigal - Seni Dert Etmeler", "Madrigal - Dip", "Kaan Boşnak - Bırakma Kendini",
    "Emir Can İğrek - Kor", "Emir Can İğrek - Nalan", "Emir Can İğrek - Beyaz Skandalım", "Emir Can İğrek - Müzik Kutusu"
];

const huzun = [
    // AHMET KAYA
    "Ahmet Kaya - Kum Gibi", "Ahmet Kaya - Ağladıkça", "Ahmet Kaya - Kafama Sıkar Giderim", "Ahmet Kaya - Kendine İyi Bak", "Ahmet Kaya - Doruklara Sevdalandım",
    "Ahmet Kaya - Şafak Türküsü", "Ahmet Kaya - Arka Mahalle", "Ahmet Kaya - Yakamoz", "Ahmet Kaya - Söyle", "Ahmet Kaya - Giderim",
    "Ahmet Kaya - Hani Benim Gençliğim", "Ahmet Kaya - Merhaba", "Ahmet Kaya - Başım Belada", "Ahmet Kaya - Beni Vur",
    // CEM KARACA & BARIŞ MANÇO
    "Cem Karaca - Tamirci Çırağı", "Cem Karaca - Islak Islak", "Cem Karaca - Resimdeki Gözyaşları", "Cem Karaca - Çok Yorgunum", "Cem Karaca - Namus Belası",
    "Barış Manço - Gülpembe", "Barış Manço - Dönence", "Barış Manço - Unutamadım", "Barış Manço - Gamzedeyim Deva Bulmam", "Barış Manço - Dağlar Dağlar",
    // ROCK & ANADOLU ROCK HÜZÜN
    "Fikret Kızılok - Gönül", "Fikret Kızılok - Bu Kalp Seni Unutur Mu", "Fikret Kızılok - Yeter Ki",
    "Erkin Koray - Çöpçüler", "Erkin Koray - Fesuphanallah", "Erkin Koray - Sevince", "Erkin Koray - Öyle Bir Geçer Zaman Ki",
    "Zülfü Livaneli - Karlı Kayın Ormanı", "Zülfü Livaneli - Leylim Ley", "Zülfü Livaneli - Yiğidim Aslanım", "Zülfü Livaneli - Güneş Topla Benim İçin",
    "Volkan Konak - Mimoza Çiçeğim", "Volkan Konak - Cerrahpaşa", "Volkan Konak - Göklerde Kartal Gibiydim", "Volkan Konak - Yarim Yarim",
    "Kazım Koyuncu - İşte Gidiyorum", "Kazım Koyuncu - Didou Nana", "Kazım Koyuncu - Hayde",
    "Haluk Levent - Elfida", "Haluk Levent - Aşkın Mapushane", "Haluk Levent - Yollarda Bulurum Seni", "Haluk Levent - Anlasana",
    "Kıraç - Endamın Yeter", "Kıraç - Gidiyorum", "Kıraç - Kan ve Gül", "Kıraç - Razıysan Gel",
    // DUMAN & MOR VE ÖTESİ
    "Duman - Her Şeyi Yak", "Duman - Haberin Yok Ölüyorum", "Duman - Seni Kendime Sakladım", "Duman - Melankoli", "Duman - Elleri Ellerime",
    "Duman - Kırmış Kalbini", "Duman - Oje", "Duman - Yanıbaşımdan",
    "Manga - Bir Kadın Çizeceksin", "Manga - Cevapsız Sorular", "Manga - Dursun Zaman",
    "Athena - Kafama Göre", "Athena - 12 Dev Adam", "Athena - Yalan",
    "Mor ve Ötesi - Bir Derdim Var", "Mor ve Ötesi - Cambaz", "Mor ve Ötesi - Daha Mutlu Olamam", "Mor ve Ötesi - Araf"
];

const pop = [
    // TARKAN - POPUN KRALI
    "Tarkan - Şımarık", "Tarkan - Kuzu Kuzu", "Tarkan - Dudu", "Tarkan - Öp", "Tarkan - Yolla", "Tarkan - Hüp", "Tarkan - Ölürüm Sana", "Tarkan - Kedi Gibi", "Tarkan - Sevdanın Son Vuruşu",
    // HANDE YENER - KRALİÇE
    "Hande Yener - Kırmızı", "Hande Yener - Romeo", "Hande Yener - Bodrum", "Hande Yener - Sopa", "Hande Yener - Acele Etme", "Hande Yener - Yalanın Batsın", "Hande Yener - Naber", "Hande Yener - Sebastian",
    // SERDAR ORTAÇ - YAZ MÜZİĞİ
    "Serdar Ortaç - Dansöz", "Serdar Ortaç - Karol", "Serdar Ortaç - Karabiberim", "Serdar Ortaç - Poşet", "Serdar Ortaç - Mikrop", "Serdar Ortaç - Mesafe", "Serdar Ortaç - Heyecan",
    // DEMET AKALIN
    "Demet Akalın - Afedersin", "Demet Akalın - Türkan", "Demet Akalın - Çalkala", "Demet Akalın - Kulüp", "Demet Akalın - Pırlanta", "Demet Akalın - Evli Mutlu Çocuklu", "Demet Akalın - Giderli Şarkılar",
    // ECE SEÇKİN & SİMGE
    "Ece Seçkin - Hoşuna mı Gidiyor", "Ece Seçkin - Adeyyo", "Ece Seçkin - Dibine Dibine",
    "Simge - Yankı", "Simge - Öpücem", "Simge - Aşkın Olayım", "Simge - Miş Miş", "Simge - Ben Bazen",
    // EDİS & ALEYNA
    "Edis - Martılar", "Edis - Arıyorum", "Edis - Çok Çok", "Edis - Yalan", "Edis - Benim Ol", "Edis - An",
    "Aleyna Tilki - Cevapsız Çınlama", "Aleyna Tilki - Sen Olsan Bari", "Aleyna Tilki - Yalnız Çiçek", "Aleyna Tilki - Dipsiz Kuyum",
    // YAZ HİTLERİ
    "Merve Özbey - Vurur Yüze İfadesi", "Merve Özbey - Yaramızda Kalsın", "Merve Özbey - Topsuz Tüfeksiz",
    "Reynmen - Ela", "Reynmen - Derdim Olsun", "Reynmen - Leila",
    "Zeynep Bastık - Uslanmıyor Bu", "Zeynep Bastık - Ara", "Zeynep Bastık - Mod",
    "Murat Boz - Özledim", "Murat Boz - Janti", "Murat Boz - Adını Bilen Yazsın", "Murat Boz - Geri Dönüş Olsa",
    "Hadise - Düm Tek Tek", "Hadise - Yaz Günü", "Hadise - Sıfır Tolerans", "Hadise - Prenses", "Hadise - Şampiyon",
    "Kenan Doğulu - Çakkıdı", "Kenan Doğulu - Doktor", "Kenan Doğulu - Baş Harfi Ben"
];

const rap = [
    // CEZA & SAGOPA
    "Ceza - Holigan", "Ceza - Yerli Plaka", "Ceza - Suspus", "Ceza - Neyim Var Ki", "Ceza - Med Cezir", "Ceza - Fark Var", "Ceza - Panaroma Harem",
    "Sagopa Kajmer - Baytar", "Sagopa Kajmer - Ateşten Gömlek", "Sagopa Kajmer - Galiba", "Sagopa Kajmer - 24", "Sagopa Kajmer - Vasiyet", "Sagopa Kajmer - Bir Pesimistin Gözyaşları", "Sagopa Kajmer - İskeletler Diyarı",
    "Norm Ender - Mekanın Sahibi", "Norm Ender - Kaktüs", "Norm Ender - Eksik Etek", "Norm Ender - Çıktık Yine Yollara",
    // EZHEL & UZI & ÇAKAL (YENİ OKUL)
    "Ezhel - Geceler", "Ezhel - Felaket", "Ezhel - İmkansızım", "Ezhel - Şehrimin Tadı", "Ezhel - Alo", "Ezhel - Olay", "Ezhel - Pavyon", "Ezhel - Hayrola",
    "Uzi - Arasan da", "Uzi - Makina", "Uzi - Umrumda Değil", "Uzi - Pappi", "Uzi - Krvn", "Uzi - Cindy", "Uzi - Senin Uğruna",
    "Sefo - Bilmem mi", "Sefo - Isabelle", "Sefo - Bonita", "Sefo - Tutsak",
    "Çakal - İmdat", "Çakal - Lütfen", "Çakal - Mahvettim", "Çakal - Riv Riv Riv", "Çakal - Antrikot",
    "Batuflex - Dalga", "Batuflex - Dumanı Pasla",
    "Lvbel C5 - 10 Numara", "Lvbel C5 - Daccia", "Lvbel C5 - Aynen Öyle",
    "Khontkar - Mary Jane", "Ben Fero - Demet Akalın", "Ben Fero - 3 2 1", "Ben Fero - Mahallemiz Esmer", "Ben Fero - Biladerim İçin",
    "Gazapizm - Heyecanı Yok", "Gazapizm - Unutulacak Dünler", "Massaka - Katliam"
];

module.exports = {
    arabesk,
    ask,
    huzun,
    pop,
    rap,
    rock: [
        "Duman - Belki Alışman Lazım", "Duman - Bu Akşam", "Duman - Köprüaltı", "Duman - Aman Aman", "Duman - Ah", "Duman - Sor Bana Pişman Mıyım",
        "Mor ve Ötesi - Cambaz", "Mor ve Ötesi - Bir Derdim Var", "Mor ve Ötesi - Oyunbozan", "Mor ve Ötesi - Şirket", "Mor ve Ötesi - Yaz Yaz Yaz",
        "Athena - Kendi Yoluna Git", "Athena - Senden Benden Bizden", "Athena - Skalonga", "Athena - Öpücük", "Athena - Ben Böyleyim",
        "Manga - Bitti Rüya", "Manga - Işıkları Söndürseler Bile", "Manga - Dünyanın Sonuna Doğmuşum", "Manga - We Could Be The Same",
        "Yüksek Sadakat - Haydi Gel İçelim", "Yüksek Sadakat - Belki Üstümüzden Bir Kuş Geçer", "Yüksek Sadakat - Kafile", "Yüksek Sadakat - Aşk Durdukça",
        "Pinhani - Hele Bi Gel", "Pinhani - Dön Bak Dünyaya", "Pinhani - Sevmekten Usanmam",
        "Gripin - Aşk Nerden Nereye", "Gripin - Beş", "Gripin - Durma Yağmur Durma",
        "Kurban - Yalan", "Kurban - Sarı Çizmeli Mehmet Ağa", "Kurban - Yine",
        "Pentagram - Sonsuz", "Pentagram - Gündüz Gece", "Pentagram - Bir",
        "Ogün Sanlısoy - Saydım", "Hayko Cepkin - Fırtınam", "Hayko Cepkin - Yarası Saklım", "Hayko Cepkin - Ölüyorum",
        "Teoman - Papatya", "Teoman - Gemiler", "Teoman - Senden Önce Senden Sonra"
    ],
    akustik: [
        "Zeynep Bastık - Felaket (Akustik)", "Zeynep Bastık - Gül Beyaz Gül (Akustik)", "Zeynep Bastık - Yol (Akustik)", "Zeynep Bastık - Her Yerde Sen",
        "Oğuzhan Koç - Gül Ki Sevgilim (Akustik)", "Oğuzhan Koç - Her Aşk Bir Gün Biter (Akustik)",
        "Manuş Baba - Eteği Belinde", "Manuş Baba - Dönersen Islık Çal", "Manuş Baba - Bu Havada Gidilmez",
        "Sena Şener - Sevmemeliyiz", "Sena Şener - Teni Tenime", "Sena Şener - Bak Bana", "Sena Şener - Ölsem",
        "Kalben - Sadece", "Kalben - Haydi Söyle", "Kalben - Saçlar",
        "Canozan - Toprak Yağmura", "Canozan - Sar Bu Şehri",
        "Kaan Boşnak - Benimle Kayboldun", "Kaan Boşnak - Bırakma Kendini",
        "İlyas Yalçıntaş - İncir", "İlyas Yalçıntaş - İçimdeki Duman",
        "Sancak - Korkma Söyle", "Bilal Sonses - İçimdeki Sen"
    ],
    nostalji: [
        "Ajda Pekkan - Kimler Geldi Kimler Geçti", "Ajda Pekkan - Bambaşka Biri", "Ajda Pekkan - Hoşgör Sen", "Ajda Pekkan - Uykusuz Her Gece", "Ajda Pekkan - Petrol",
        "Barış Manço - Alla Beni Pulla Beni", "Barış Manço - Kara Sevda", "Barış Manço - Arkadaşım Eşek", "Barış Manço - Dağlar Dağlar", "Barış Manço - Sarı Çizmeli Mehmet Ağa",
        "MFÖ - Ele Güne Karşı", "MFÖ - Sarı Laleler", "MFÖ - Güllerin İçinden", "MFÖ - Sakın Gelme", "MFÖ - Mazeretim Var Asabiyim Ben",
        "Sezen Aksu - Firuze", "Sezen Aksu - Hadi Bakalım", "Sezen Aksu - Şinanay", "Sezen Aksu - Kaçın Kurası",
        "Erol Evgin - Ateşle Oynama", "Erol Evgin - İşte Öyle Bir Şey", "Erol Evgin - Söyle Canım",
        "Nükhet Duru - Melankoli", "Nükhet Duru - Ben Sana Vurgunum", "Nükhet Duru - Destina",
        "Tanju Okan - Öyle Sarhoş Olsam Ki", "Tanju Okan - Kadınım", "Tanju Okan - Hasret",
        "Semiramis Pekkan - Bana Yalan Söylediler",
        "Füsun Önal - Senden Başka", "Füsun Önal - Ah Nerede",
        "Berkant - Samanyolu", "Ayten Alpman - Memleketim",
        "Erkin Koray - Estarabim", "Erkin Koray - Arap Saçı",
        "Cici Kızlar - Delisin", "Yeliz - Yalan", "Ayla Dikmen - Anlamazdın",
        "Nil Burak - Birisine Birisine", "Seyyal Taner - Şiirimin Dili"
    ],
    yabanci: [
        "The Weeknd - Blinding Lights", "The Weeknd - Save Your Tears", "The Weeknd - Starboy", "The Weeknd - The Hills", "The Weeknd - I Feel It Coming",
        "Dua Lipa - Levitating", "Dua Lipa - Don't Start Now", "Dua Lipa - New Rules", "Dua Lipa - Physical", "Dua Lipa - Love Again",
        "Ed Sheeran - Shape of You", "Ed Sheeran - Perfect", "Ed Sheeran - Bad Habits", "Ed Sheeran - Thinking Out Loud", "Ed Sheeran - Shivers",
        "Adele - Rolling in the Deep", "Adele - Someone Like You", "Adele - Hello", "Adele - Set Fire to the Rain", "Adele - Easy On Me",
        "Billie Eilish - Bad Guy", "Billie Eilish - Lovely", "Billie Eilish - Happier Than Ever", "Billie Eilish - Ocean Eyes",
        "Imagine Dragons - Believer", "Imagine Dragons - Radioactive", "Imagine Dragons - Demons", "Imagine Dragons - Thunder", "Imagine Dragons - Enemy",
        "Coldplay - Viva La Vida", "Coldplay - Yellow", "Coldplay - Hymn for the Weekend", "Coldplay - Paradise", "Coldplay - Adventure of a Lifetime",
        "Queen - Bohemian Rhapsody", "Queen - We Will Rock You", "Queen - Don't Stop Me Now", "Queen - Another One Bites the Dust", "Queen - Radio Ga Ga",
        "Michael Jackson - Billie Jean", "Michael Jackson - Thriller", "Michael Jackson - Beat It", "Michael Jackson - Smooth Criminal", "Michael Jackson - Black or White",
        "Eminem - Lose Yourself", "Eminem - Without Me", "Eminem - The Real Slim Shady", "Eminem - Mockingbird",
        "Rihanna - Diamonds", "Rihanna - Umbrella", "Rihanna - Work", "Rihanna - We Found Love",
        "Sia - Chandelier", "Sia - Cheap Thrills", "Sia - Unstoppable"
    ],
    party: [
        "Hande Yener - Kırmızı", "Tarkan - Şımarık", "Demet Akalın - Kulüp", "Gülşen - Bangır Bangır",
        "Serdar Ortaç - Dansöz", "Hadise - Düm Tek Tek", "Edis - Arıyorum", "Reynmen - Ela",
        "Sefo - Bilmem mi", "Ezhel - Felaket", "Ben Fero - Demet Akalın",
        "Pitbull - Give Me Everything", "Jennifer Lopez - On The Floor", "Shakira - Waka Waka",
        "Daddy Yankee - Despacito", "Psy - Gangnam Style", "LMFAO - Party Rock Anthem",
        "Black Eyed Peas - I Gotta Feeling", "Avicii - Wake Me Up", "Calvin Harris - Summer",
        "Tarkan - Kuzu Kuzu", "Kenan Doğulu - Çakkıdı", "Ajda Pekkan - Arada Sırada"
    ]
};
