console.log("Wrecked: Script starting (v15 - Bilingual)...");

const CLIENT_ID = '0be6ca4e028244c89479aa37ebd9ce1d';
const REDIRECT_URI = 'https://wrecked-app.vercel.app/index.html';
const SCOPES = 'user-top-read user-read-email user-read-private';

// --- I18N CONFIG ---
let currentLang = localStorage.getItem('wrecked_lang') || 'tr';

const UI_TEXTS = {
    // Buttons & Titles
    "btn-login": { tr: "Spotify ile Yüzleş", en: "Face Your Spotify" },
    "btn-start": { tr: "Yıkımı Başlat", en: "Start the Wreckage" },
    "btn-next-albums": { tr: "💿 Suç Ortakları ➡", en: "💿 Partners in Crime ➡" },
    "btn-next-artists": { tr: "🎤 Tarikat Liderlerin ➡", en: "🎤 Cult Leaders ➡" },
    "btn-next-genres": { tr: "🎹 Tür Karmaşası ➡", en: "🎹 Genre Chaos ➡" },
    "btn-next-stats": { tr: "📊 Hasar Raporu ➡", en: "📊 Damage Report ➡" },
    "btn-next-persona": { tr: "🔮 Falına Bak ➡", en: "🔮 Read My Fortune ➡" },
    "btn-next-summary": { tr: "🏁 Sonuç Kartını Görüntüle ➡", en: "🏁 View Final Card ➡" },
    "btn-restart": { tr: "Başa Dön ↺", en: "Restart ↺" },
    // Headers
    "h-login": { tr: "Müzik Zevkin<br>Mahvolmuş", en: "Your Music Taste<br>Is Wrecked" },
    "subtitle-login": { tr: "Bu yıl kulaklarına neler yaptığını görmeye hazır mısın?", en: "Ready to see what you did to your ears this year?" },
    "h-loading": { tr: "Utanç verici verilerin<br>indiriliyor...", en: "Downloading your<br>shameful data..." },
    // Sections
    "t-songs": { tr: "🎧 Kulak Kanaması Sebepleri", en: "🎧 Ear Bleeding Causes" },
    "t-albums": { tr: "💿 Plak Ziyanı", en: "💿 Vinyl Waste" },
    "t-artists": { tr: "🎤 Tarikat Liderlerin", en: "🎤 Cult Leaders" },
    "t-genres": { tr: "🎹 Tür Karmaşası", en: "🎹 Genre Chaos" },
    "t-stats": { tr: "Hasar Raporu", en: "Damage Report" },
    "t-persona": { tr: "🔮 Büyük Yüzleşme", en: "🔮 The Grand Confrontation" },
    "t-summary": { tr: "🏁 Kaza Raporu Özeti", en: "🏁 Crash Report Summary" },
    // Stats
    "lbl-era": { tr: "Ruh Yaşın", en: "Soul Age" },
    "lbl-score": { tr: "Banal Skoru", en: "Basic Score" },
    "lbl-genre": { tr: "Favori Tür", en: "Top Genre" },
    "lbl-toxic": { tr: "Toksik Özellik", en: "Toxic Trait" },
    "lbl-city": { tr: "Ruh Şehri", en: "Soul City" },
    "lbl-art-count": { tr: "Farklı Sanatçı", en: "Unique Artists" },
    "lbl-gen-count": { tr: "Keşfedilen Tür", en: "Genres Found" },
    // Recs
    "h-rec-mov": { tr: "🎬 İzle", en: "🎬 Watch" },
    "h-rec-read": { tr: "📚 Oku", en: "📚 Read" },
    "h-rec-mov-sum": { tr: "🎬 İzle", en: "🎬 Watch" },
    "h-rec-read-sum": { tr: "📚 Oku", en: "📚 Read" },
    // Share
    "h-share": { tr: "Sonucunu Paylaş", en: "Share Result" },
    "p-share": { tr: "Instagram, WhatsApp veya X'e gönder.", en: "Post to Instagram, WhatsApp or X." },
    "btn-share-native": { tr: "🚀 HIZLI PAYLAŞ", en: "🚀 SHARE NOW" },
    "btn-download": { tr: "💾 Sadece İndir", en: "💾 Download Only" }
};

// --- DATA STORE ---
let allTopTracks = [];
let allTopArtists = [];
let topAlbums = [];
let topGenres = [];
let musicEra = "MODERN";
let varietyScore = "LOW";
let dominantGenreGroup = "POP";
let mainstreamScore = 50;
let toxicTrait = "Ortalama İnsan";
let toxicTraitEN = "Average Joe";
let detailedSpiritAge = "Milenyum Çocuğu";
let detailedSpiritAgeEN = "Millennial";
let generatedFortunText = "";
let currentPersona = null; // Store for Recs reuse

// --- GENERIC HELPERS ---
function toggleLanguage() {
    currentLang = currentLang === 'tr' ? 'en' : 'tr';
    localStorage.setItem('wrecked_lang', currentLang);
    // Fix: Update HTML lang attribute for correct CSS uppercasing (i vs İ)
    document.documentElement.lang = currentLang;

    updateDomTexts();
    // Re-render dynamic content if data exists
    if (allTopArtists.length > 0) {
        updateStats();
        if (currentPersona) generateFortune();
        populateSummary();
    }
}

function updateDomTexts() {
    document.getElementById('btn-lang').innerText = currentLang === 'tr' ? "TR | EN" : "EN | TR";

    // Auto-update elements with data-i18n (if we used that) OR manual map
    // Manual mapping for now based on IDs
    const map = {
        'btn-login': 'btn-login', 'btn-start': 'btn-start',
        'btn-next-albums': 'btn-next-albums', 'btn-next-artists': 'btn-next-artists',
        'btn-next-genres': 'btn-next-genres', 'btn-next-stats': 'btn-next-stats',
        'btn-next-persona': 'btn-next-persona', 'btn-next-summary': 'btn-next-summary',
        'btn-restart': 'btn-restart'
    };

    // Update simple IDs matches
    for (const [id, key] of Object.entries(map)) {
        const el = document.getElementById(id);
        if (el) el.innerText = UI_TEXTS[key][currentLang];
    }

    // Update Headers (some are classes or complex)
    document.querySelector('#screen-login h1').innerHTML = UI_TEXTS['h-login'][currentLang];
    document.querySelector('#screen-login p').innerText = UI_TEXTS['subtitle-login'][currentLang];
    document.querySelector('#screen-welcome h2').innerHTML = UI_TEXTS['h-loading'][currentLang];

    // Section Headers
    document.querySelector('#screen-songs h2').innerText = UI_TEXTS['t-songs'][currentLang];
    document.querySelector('#screen-albums h2').innerText = UI_TEXTS['t-albums'][currentLang];
    document.querySelector('#screen-artists h2').innerText = UI_TEXTS['t-artists'][currentLang];
    document.querySelector('#screen-genres h2').innerText = UI_TEXTS['t-genres'][currentLang];
    document.querySelector('#screen-stats h2').innerText = UI_TEXTS['t-stats'][currentLang];
    document.querySelector('#screen-persona h2').innerText = UI_TEXTS['t-persona'][currentLang];
    document.querySelector('#screen-summary h2').innerText = UI_TEXTS['t-summary'][currentLang];

    // Stats Labels
    document.querySelector('.era-box h3').innerText = UI_TEXTS['lbl-era'][currentLang];
    document.querySelector('.score-box h3').innerText = UI_TEXTS['lbl-score'][currentLang];
    document.querySelector('.top-genre-box h3').innerText = UI_TEXTS['lbl-genre'][currentLang];
    document.querySelector('.trait-box h3').innerText = UI_TEXTS['lbl-toxic'][currentLang];
    document.querySelector('.city-box h3').innerText = UI_TEXTS['lbl-city'][currentLang];
    document.querySelector('.artist-box h3').innerText = UI_TEXTS['lbl-art-count'][currentLang];
    document.querySelector('.genre-box h3').innerText = UI_TEXTS['lbl-gen-count'][currentLang];

    // Recs Headers
    document.querySelector('#screen-persona .rec-column:nth-child(1) h4').innerText = UI_TEXTS['h-rec-mov'][currentLang];
    document.querySelector('#screen-persona .rec-column:nth-child(2) h4').innerText = UI_TEXTS['h-rec-read'][currentLang];

    // Share
    document.querySelector('.share-actions-container h3').innerText = UI_TEXTS['h-share'][currentLang];
    document.querySelector('.share-actions-container p').innerText = UI_TEXTS['p-share'][currentLang];
    document.querySelector('.share-native').innerText = UI_TEXTS['btn-share-native'][currentLang];
    document.querySelector('.download').innerText = UI_TEXTS['btn-download'][currentLang];
}

// --- ABSURD STORY GENERATOR ---
const ARCHETYPE_TEMPLATES = {
    // ... Keeping logic (same as v10)
    "ROCK": (art, era, city) => `Yıl 2055, ${city} harabelerinde bir kamp ateşi başındasın. ${art}, üzerinde tozlu bir deri ceketle beliriyor. Eline aldığı kırık bir gitarla sana vuruyor: "Hala mı ${era}? Hala mı o eski kafalar?" diyor. "Biz dünyayı yaktık, sen hala o solonun peşindesin."`,
    "ROCK_OLD": (art, era, city) => `${city}'de boyutlar arası bir plakçıdasın. ${art} tezgahın arkasında, sana acıyarak bakıyor. "Bu albümü 500. kez alıyorsun," diyor. "Kozmik dengeyi bozdun. ${era} dönemine saplanıp kaldın, lütfen artık evine, yani bugüne dön."`,
    "POP": (art, era, city) => `Mars'taki ilk AVM'nin açılışındasın. ${art}, elinde neon bir latte ile yanına geliyor. "Tatlım," diyor, "Senin bu ${era} takıntın yüzünden kolonideki herkesin başı ağrıdı. Müziği kısıp biraz sessizliği dinlemeye ne dersin?"`,
    "POP_RETRO": (art, era, city) => `${city} metrosunda zaman durmuş. ${art} yanında oturuyor ve sakızını çiğniyor. "Biliyor musun," diyor, "${era} modası geçtiğinde sen daha doğmamıştın belki. Bu nostalji şovu biraz fazla olmadı mı?"`,
    "URBAN": (art, era, city) => `Bir simülasyonun içindesin, mekan distopik ${city}. ${art} sana bakıp gülüyor. "Kodlarını inceledim," diyor. "Sadece ${era} ve hüzün var. Biraz güncelleme yap, yoksa seni silmek zorunda kalacaklar."`,
    "ELECTRO": (art, era, city) => `Galaktik bir rave partisindesin, ama müzik yok. ${art} DJ kabininde sana bakıyor. "Müziği kestim çünkü senin ${era} ritimlerin yüzünden geminin motoru bozuldu. ${city} atmosferinden çıkamıyoruz senin yüzünden."`,
    "ELECTRO_MODERN": (art, era, city) => `${city}'de bir yeraltı sığınağındasın. ${art} sana bir enerji içeceği uzatıyor. "Bu kadar bass beynini eritmiş," diyor. "Dışarıda zombiler var, sen hala drop bekliyorsun."`,
    "INDIE": (art, era, city) => `${city}'de sonsuz bir yağmur yağıyor. ${art} ile şemsiyesiz yürüyorsunuz. "O kadar depresifsin ki bulutlar senin için ağlıyor," diyor. "${era} melankolisi bitti sanıyordum, meğer sen hala yaşatıyormuşsun."`,
    "MIX": (art, era, city) => `${city}'de bir rüya görüyorsun. ${art} karşına çıkıp diyor ki: "O kadar karışık çalıyorsun ki evrenin algoritması bozuldu. ${era} desen değil, modern desen değil. Ne olduğunu seç artık!"`
};

const ARCHETYPES_DB = {
    // --- ROCK (6) ---
    "ROCK_OLD_LOW": {
        tit: { tr: "Analog Dinozor", en: "Analog Dinosaur" },
        desc: {
            tr: "Tarih öncesi bir mağarada gibisin. {a} dinleyerek modern dünyanın tüm sorunlarından kaçıyorsun. Senin için müzik 1979'da bitti. Streaming servislerini 'ruhsuz' buluyorsun ama {c} sokaklarında elinde iPhone ile gezmekten geri kalmıyorsun. Çelişkiler prensi.",
            en: "You are like a caveman in a prehistoric era. You listen to {a} to escape modern problems. For you, music died in 1979. You find streaming 'soulless' yet you walk the streets of {c} with your iPhone. Prince of contradictions."
        },
        m: ["Easy Rider", "The Doors"], b: ["Life (Keith Richards)", "Just Kids"]
    },
    "ROCK_OLD_HIGH": {
        tit: { tr: "Plak Zombisi", en: "Vinyl Zombie" },
        desc: {
            tr: "Evin toz ve eski kağıt kokuyor olmalı. {a} plağının .001 baskısını bulmak için böbreğini satabilirsin. {c} bit pazarında insanları itip kakarak 'orijinal baskı' arıyorsun. Müzik dinlemekten çok biriktirmeyi seviyorsun.",
            en: "Your house must smell of dust and old paper. You'd sell a kidney for a .001 press of {a}. You push people in {c} flea markets looking for 'original pressings'. You like collecting music more than listening to it."
        },
        m: ["Boat That Rocked", "Velvet Goldmine"], b: ["Please Kill Me", "Clothes Clothes Clothes"]
    },
    "ROCK_RETRO_LOW": {
        tit: { tr: "Depresif Grunge", en: "Depressive Grunge" },
        desc: {
            tr: "90'ların o kareli gömlekli depresyonundan hala çıkamadın. {a} çalarken tavana bakıp hayatın anlamsızlığını sorguluyorsun. {c} yağmurlu değilse bile senin içinde hep fırtına var. Biraz güneş görsen eriyecek gibisin.",
            en: "You never left that plaid-shirt depression of the 90s. While {a} plays, you stare at the ceiling questioning life. Even if {c} isn't rainy, there's a storm inside you. You'd melt if you saw some sun."
        },
        m: ["Singles", "Last Days"], b: ["Heavier Than Heaven", "Come As You Are"]
    },
    "ROCK_RETRO_HIGH": {
        tit: { tr: "Alternatif Emeklisi", en: "Alternative Retiree" },
        desc: {
            tr: "Eskiden festivallerde en öndeydin, şimdi belin ağrıyor. {a} dinleyip 'gençler anlamıyor' diyorsun. {c} kafelerinde oturup latte içerken eski güzel günleri, o çamurlu konserleri özlüyorsun ama artık konforun daha tatlı geliyor.",
            en: "You used to be front row at festivals, now your back hurts. You listen to {a} and say 'kids don't get it'. Sipping lattes in {c} cafes, you miss the muddy concerts but prefer comfort now."
        },
        m: ["Trainspotting", "High Fidelity"], b: ["Meet Me in the Bathroom", "Unknown Pleasures"]
    },
    "ROCK_MODERN_LOW": {
        tit: { tr: "Gürültü Bağımlısı", en: "Noise Addict" },
        desc: {
            tr: "Kulağında {a} çalarken dünya umurunda değil. Komşuların senden nefret ediyor olabilir ama sen {c} sokaklarında kendi rock operanı yaşıyorsun. Senin için sessizlik, korkutucu bir boşluktan ibaret.",
            en: "With {a} in your ears, you ignore the world. Neighbors might hate you, but you're living your rock opera in {c} streets. Silence is just a scary void for you."
        },
        m: ["School of Rock", "Scott Pilgrim"], b: ["Fargo Rock City", "Lexicon Devil"]
    },
    "ROCK_MODERN_HIGH": {
        tit: { tr: "Janra Bükücü", en: "Genre Bender" },
        desc: {
            tr: "Sadece rock değil, her şeyi karıştırıyorsun ama kökünde o isyan var. {a} ile başlayıp bambaşka yerlere gidiyorsun. {c} şehrinin en entel görünümlü ama en karışık kafalı insanı sensin.",
            en: "Not just rock, you mix everything but the rebellion stays. Starting with {a}, you go places. You are the most intellectual yet confused person in {c}."
        },
        m: ["Baby Driver", "Whiplash"], b: ["Musicophilia", "How Music Works"]
    },

    // --- POP (6) ---
    "POP_OLD_LOW": {
        tit: { tr: "Simli Disko Topu", en: "Glitter Disco Ball" },
        desc: {
            tr: "Hala 70'ler diskosunda gibisin. {a} çalınca yerinde duramıyorsun. Senin için hayat sonsuz bir parti ve sen {c} pistlerinin aranan yüzüsün, en azından kendi hayal dünyanda.",
            en: "Still in a 70s disco. Can't sit still when {a} plays. Life is an endless party and you're the star of {c} dancefloors, at least in your head."
        },
        m: ["Saturday Night Fever", "Grease"], b: ["The Beautiful Fall", "Party Monster"]
    },
    "POP_OLD_HIGH": {
        tit: { tr: "Glamour Eksperi", en: "Glamour Expert" },
        desc: {
            tr: "Eski Hollywood ışıltısı, abartılı dramalar... {a} dinlerken kendini siyah beyaz bir filmin başrolü sanıyorsun. {c} seni hak etmiyor, sen aslında çok daha büyük sahneler için yaratılmıştın.",
            en: "Old Hollywood glam, excessive drama... Listening to {a}, you feel like a movie star. {c} doesn't deserve you, you were made for bigger stages."
        },
        m: ["Rocketman", "Judy"], b: ["Fifth Avenue", "Warhol"]
    },
    "POP_RETRO_LOW": {
        tit: { tr: "90s Boyband Artığı", en: "90s Boyband Leftover" },
        desc: {
            tr: "Odanın duvarlarında hala posterler olmalı. {a} senin ilk aşkın ve asla vazgeçmedin. {c} sokaklarında walkman ile geziyor gibisin. Büyümeyi reddetmek senin süper gücün.",
            en: "Posters must still be on your walls. {a} was your first love. You walk {c} like you have a Walkman. Refusing to grow up is your superpower."
        },
        m: ["Spice World", "Clueless"], b: ["I Want It That Way", "Totally!"]
    },
    "POP_RETRO_HIGH": {
        tit: { tr: "Hit Makinesi Kurbanı", en: "Hit Machine Victim" },
        desc: {
            tr: "Radyoda ne çalarsa onu ezberledin. {a} senin için bir ilah. Popüler kültür ne derse o. Kendi fikrin yok gibi ama olsun, {c} partilerinin en uyumlu insanı sensin.",
            en: "You memorized whatever was on radio. {a} is a god. You follow pop culture blindly. No opinions of your own, but hey, you fit perfectly in {c} parties."
        },
        m: ["Mean Girls", "Legally Blonde"], b: ["The Song Machine", "Switched On Pop"]
    },
    "POP_MODERN_LOW": {
        tit: { tr: "Takıntılı Stan", en: "Obsessed Stan" },
        desc: {
            tr: "Twitter'da {a} için kavga etmekten yorulmadın mı? 'Mother' dediğin sanatçılar için {c} meydanında nöbet tutarsın. Hayatın fan sayfaları ve stream kasmak arasında geçiyor. Biraz çimene dokun.",
            en: "Tired of fighting for {a} on Twitter? You'd camp in {c} for artists you call 'Mother'. Life is just fan pages and streaming. Touch some grass."
        },
        m: ["Miss Americana", "Gaga: Five Foot Two"], b: ["Fangirls", "Everything I Know About Love"]
    },
    "POP_MODERN_HIGH": {
        tit: { tr: "TikTok Algoritması", en: "TikTok Algorithm" },
        desc: {
            tr: "Senin müzik zevkin 15 saniyelik videolardan ibaret. {a} şarkısının sadece nakaratını biliyorsun. Dikkat süren o kadar kısa ki {c} metrosunda bir durak bile gidemezsin telefonuna bakmadan.",
            en: "Your taste is just 15s videos. You only know the chorus of {a}. Your attention span is so short you can't go one stop in {c} subway without checking your phone."
        },
        m: ["Bodies Bodies Bodies", "Euphoria"], b: ["Trick Mirror", "Selfie"]
    },

    // --- URBAN (6) ---
    "URBAN_OLD_LOW": {
        tit: { tr: "Dinozor Rapçi", en: "Dinosaur Rapper" },
        desc: {
            tr: "'Gerçek hiphop bu değil' demekten dilinde tüy bitti. {a} dinleyip yeni nesile küfrediyorsun. {c} sokaklarında bol pantolonla gezen son kişisin. Saygı duyuyoruz ama devir değişti.",
            en: "Tired of saying 'This ain't real hiphop'. You listen to {a} and curse the new gen. Last person in {c} with baggy pants. Respect, but times changed."
        },
        m: ["Straight Outta Compton", "Boyz n the Hood"], b: ["The Rose That Grew From Concrete", "Decoded"]
    },
    "URBAN_OLD_HIGH": {
        tit: { tr: "Soul Koleksiyoncusu", en: "Soul Collector" },
        desc: {
            tr: "Plakların ve senin o derin, hüzünlü havan... {a} çalarken gözlerin doluyor. {c} şehrinin gürültüsünde sen kendi sessiz, kederli ve asil dünyanı kurmuşsun.",
            en: "Your records and that deep, sad vibe... You tear up to {a}. Amidst {c} noise, you built a silent, sorrowful, noble world."
        },
        m: ["Ray", "Respect"], b: ["Divided Soul", "Blues People"]
    },
    "URBAN_RETRO_LOW": {
        tit: { tr: "Kliplerdeki Figüran", en: "Music Video Extra" },
        desc: {
            tr: "2000'lerin MTV kliplerinde yaşıyorsun. {a} ve bling-bling kolyeler... Kendini bir video klipte sanarak {c} caddelerinde yürüyorsun ama kamera yok, sadece biz varız ve seni yargılıyoruz.",
            en: "Living in 2000s MTV videos. {a} and bling-bling... Walking {c} thinking you're in a video, but there's no camera, just us judging you."
        },
        m: ["8 Mile", "Hustle & Flow"], b: ["The Rap Year Book", "Ego Trip"]
    },
    "URBAN_RETRO_HIGH": {
        tit: { tr: "Old School Kafa", en: "Old School Head" },
        desc: {
            tr: "Boom-bap ritimleri ve sprey boya kokusu. {a} senin için bir yaşam tarzı. {c} duvarlarına adını yazmak istiyorsun ama muhtemelen sadece Instagram'a hikaye atıyorsun.",
            en: "Boom-bap beats and spray paint smell. {a} is a lifestyle. You want to tag {c} walls but probably just posting Instagram stories."
        },
        m: ["Do The Right Thing", "Juice"], b: ["Can't Stop Won't Stop", "Book of Rhymes"]
    },
    "URBAN_MODERN_LOW": {
        tit: { tr: "Auto-Tune Mağduru", en: "Auto-Tune Victim" },
        desc: {
            tr: "Ne dediği anlaşılmayan şarkıları seviyorsun. {a} mırıldanırken sen de ritme kafa sallıyorsun. {c} gece hayatının en hızlısı ama en anlamsızı sensin.",
            en: "You love mumbled songs. Headbanging while {a} hums. Fastest but most meaningless figure of {c} nightlife."
        },
        m: ["Spring Breakers", "Atlanta"], b: ["The Marathon Don't Stop", "Raw"]
    },
    "URBAN_MODERN_HIGH": {
        tit: { tr: "Entel Rapçi", en: "Intellectual Rapper" },
        desc: {
            tr: "Rap dinliyorsun ama sadece sözleri derin olanları. {a} senin için bir şair. Arkadaşlarına sürekli 'alt metni anlamadın' diyerek {c} kafelerinde nutuk çekiyorsun. Yorucusun.",
            en: "You listen to rap with 'deep lyrics'. {a} is a poet to you. Lecturing friends in {c} cafes saying 'you missed the subtext'. Exhausting."
        },
        m: ["Waves", "Moonlight"], b: ["Go Ahead in the Rain", "God Save the Queer"]
    },

    // --- ELECTRO (6) ---
    "ELECTRO_OLD_LOW": {
        tit: { tr: "Neon Dedektif", en: "Neon Detective" },
        desc: {
            tr: "Synthwave dinleyip kendini Blade Runner filminde sanıyorsun. {a} senin soundtrack'in. {c} yağmurunda yakalarını kaldırıp yürüyorsun, peşinde bir replikant varmış gibi.",
            en: "Listening to Synthwave, thinking you're in Blade Runner. {a} is your soundtrack. Walking in {c} rain, collar up, like a replicant is chasing you."
        },
        m: ["Tron", "Blade Runner"], b: ["Rip It Up", "Energy Flash"]
    },
    "ELECTRO_OLD_HIGH": {
        tit: { tr: "Synth Mühendisi", en: "Synth Engineer" },
        desc: {
            tr: "Müzik değil, matematik dinliyorsun. {a} senin için bir denklem. İnsanlar dans ederken sen frekans aralıklarını analiz ediyorsun. {c} kulüplerinde en köşede duran o ciddi tip sensin.",
            en: "Not music, but math. {a} is an equation. You analyze frequencies while people dance. The serious guy in the corner of {c} clubs."
        },
        m: ["Kraftwerk: Pop Art", "Sound City"], b: ["Mars by 1980", "Analog Days"]
    },
    "ELECTRO_RETRO_LOW": {
        tit: { tr: "Rave Gazisi", en: "Rave Veteran" },
        desc: {
            tr: "90'ların o yasadışı depo partilerini özlüyorsun. {a} çalınca gözlerin parlıyor. Vücudun {c} ofisinde olabilir ama ruhun hala o terli ve karanlık tünelde dans ediyor.",
            en: "Missing 90s illegal warehouse parties. Eyes light up with {a}. Body in {c} office, soul dancing in that sweaty dark tunnel."
        },
        m: ["Human Traffic", "Groove"], b: ["Altered State", "Der Klang der Familie"]
    },
    "ELECTRO_RETRO_HIGH": {
        tit: { tr: "IDM Filozofu", en: "IDM Philosopher" },
        desc: {
            tr: "Ritimler ne kadar bozuksa o kadar seviyorsun. {a} dinleyerek zekanı kanıtlamaya çalışıyorsun. {c} sana çok düz geliyor, sen kaosun içindeki düzeni arıyorsun.",
            en: "The more broken the rhythm, the better. Proving intellect via {a}. {c} is too plain, you seek order in chaos."
        },
        m: ["Pi", "Modulations"], b: ["Ocean of Sound", "More Brilliant than the Sun"]
    },
    "ELECTRO_MODERN_LOW": {
        tit: { tr: "Patlak Hoparlör", en: "Blown Speaker" },
        desc: {
            tr: "Bass vursun yeter. {a} ile kulak zarlarını test ediyorsun. Komşularının kabusu, {c} trafiğindeki o gürültülü arabanın sahibi sensin. Sığ ama mutlusun.",
            en: "Just need that Bass. Testing eardrums with {a}. Nightmare of neighbors, driver of that loud car in {c}. Shallow but happy."
        },
        m: ["We Are Your Friends", "Eden"], b: ["Last Night a DJ Saved My Life", "Rave On"]
    },
    "ELECTRO_MODERN_HIGH": {
        tit: { tr: "Berlin Duvarı", en: "Berlin Wall" },
        desc: {
            tr: "Simsiyah giyinip, güneş gözlüğüyle {c} karanlığında oturuyorsun. {a} senin tekno ilahın. Gülümsemek yasak, eğlenmek yasak, sadece ritim var. Çok havalı göründüğünü sanıyorsun.",
            en: "All black, sunglasses in {c} dark. {a} is your techno god. No smiling, no fun, just rhythm. You think you look cool."
        },
        m: ["Victoria", "Climax"], b: ["Klang der Familie", "Techno Rebels"]
    },

    // --- INDIE (6) ---
    "INDIE_OLD_LOW": {
        tit: { tr: "Folk Ozanı", en: "Folk Bard" },
        desc: {
            tr: "Akustik gitar ve sigara dumanı. {a} dinleyip {c} şehrine küsüyorsun. 'Her şey eskiden samimiydi' diyerek modern hayatı reddediyorsun ama WiFi şifresini sormadan da edemiyorsun.",
            en: "Acoustic guitar meets smoke. Listening to {a}, sulking at {c}. Rejecting modern life saying 'it was authentic back then' but asking for WiFi password."
        },
        m: ["Inside Llewyn Davis", "Walk the Line"], b: ["Chronicles", "Bound for Glory"]
    },
    "INDIE_OLD_HIGH": {
        tit: { tr: "Woodstock Artığı", en: "Woodstock Leftover" },
        desc: {
            tr: "Çıplak ayakla çimlere basmak istiyorsun ama {c} betonundan fırsat yok. {a} senin ruhani rehberin. Barış ve aşk diyorsun ama trafikte canavara dönüşüyorsun.",
            en: "Want to walk barefoot on grass but {c} is concrete. {a} is your spirit guide. Peace and love, until you're in traffic."
        },
        m: ["Almost Famous", "Taking Woodstock"], b: ["Electric Kool-Aid Acid Test", "Slouching Towards Bethlehem"]
    },
    "INDIE_RETRO_LOW": {
        tit: { tr: "Ayakkabı İzleyen", en: "Shoegazer" },
        desc: {
            tr: "Göz temasından kaçınıyorsun. {a} dinleyip {c} sokaklarında hayalet gibi süzülüyorsun. O kadar içinesin ki, kendi varlığını bile unutmuş gibisin.",
            en: "Avoiding eye contact. Floating like a ghost in {c} with {a}. So introverted you forgot your own existence."
        },
        m: ["Lost in Translation", "Eternal Sunshine"], b: ["Norwegian Wood", "The Bell Jar"]
    },
    "INDIE_RETRO_HIGH": {
        tit: { tr: "Pitchfork Editörü", en: "Pitchfork Editor" },
        desc: {
            tr: "Kimsenin bilmediği grupları bilmek senin işin. {a} artık popüler oldu diye dinlemeyi bırakmışsındır. {c} kahvecilerinde insanları müzik zevklerine göre yargılayıp not veriyorsun.",
            en: "Knowing unknown bands is your job. Probably stopped listening to {a} cuz they got popular. Judging people's taste in {c} coffee shops."
        },
        m: ["Her", "Frances Ha"], b: ["Our Band Could Be Your Life", "Retromania"]
    },
    "INDIE_MODERN_LOW": {
        tit: { tr: "Ukuleleli Depresyon", en: "Ukulele Depression" },
        desc: {
            tr: "Ağlak bir ses tonu, yumuşak akorlar... {a} dinleyip battaniye altında ağlıyorsun. {c} sana çok kaba ve gürültülü geliyor. Sen sadece 'soft' şeyler istiyorsun.",
            en: "Weepy voice, soft chords... Crying under blanket to {a}. {c} is too rude and loud. You just want 'soft' things."
        },
        m: ["Lady Bird", "Submarine"], b: ["Sally Rooney Books", "Crying in H Mart"]
    },
    "INDIE_MODERN_HIGH": {
        tit: { tr: "Hipster Kralı", en: "King of Hipsters" },
        desc: {
            tr: "Bez çanta, vintage gözlük ve {a}. Yürüyen bir klişesin ama kendini çok orijinal sanıyorsun. {c} semtlerinin kiralarını yükselten o 'cool' kitle sensin.",
            en: "Tote bag, vintage glasses, {a}. Walking cliché thinking you're original. The 'cool' crowd raising rents in {c}."
        },
        m: ["The Worst Person in the World", "Paterson"], b: ["Infinite Jest", "A Little Life"]
    },

    // --- MIX (6) ---
    "MIX_OLD_LOW": {
        tit: { tr: "Nostaljik Çorba", en: "Nostalgic Soup" },
        desc: {
            tr: "Eski olan her şeyi seviyorsun, türü ne olursa olsun. {a} ile başlayıp bambaşka bir eski şarkıya geçiyorsun. {c} antikacı dükkanı gibi bir zihnin var, tozlu ve karışık.",
            en: "You love anything old. Starting with {a}, jumping to another oldie. Your mind is like a {c} antique shop, dusty and cluttered."
        },
        m: ["Forest Gump", "Big Fish"], b: ["100 Years of Solitude", "Madonna in a Fur Coat"]
    },
    "MIX_OLD_HIGH": {
        tit: { tr: "Kültür Mantarı", en: "Culture Mushroom" },
        desc: {
            tr: "Hem caz, hem rock, hem klasik... {a} dinlerken kendini çok donanımlı hissediyorsun. {c} entelijansiyasına girmek için çok çabalıyorsun. Biraz sal gitsin.",
            en: "Jazz, rock, classical... Feeling sophisticated with {a}. Trying too hard to join {c} intelligentsia. Just chill."
        },
        m: ["Midnight in Paris", "Amelie"], b: ["A Moveable Feast", "The Traveller"]
    },
    "MIX_RETRO_LOW": {
        tit: { tr: "Karışık Kaset", en: "Mixtape" },
        desc: {
            tr: "Radyocu gibi adamsın. {a} de çalar, pop da çalar. Senin bir tarzın yok, senin tarzın her şey. {c} taksi şoförleriyle en iyi anlaşan insan sensin.",
            en: "You're like a radio DJ. {a}, pop, whatever. You have no style, your style is everything. You get along best with {c} taxi drivers."
        },
        m: ["Guardians of the Galaxy", "Baby Driver"], b: ["Ready Player One", "Armada"]
    },
    "MIX_RETRO_HIGH": {
        tit: { tr: "Shuffle Bağımlısı", en: "Shuffle Addict" },
        desc: {
            tr: "Odaklanma sorunun var. Bir şarkıyı bitiremiyorsun. {a} çalarken aklın başka yerde. {c} şehrinin kaosu senin beyninin yanında düzenli kalır.",
            en: "Focus issues. Can't finish a song. Mind wanders during {a}. {c}'s chaos is orderly compared to your brain."
        },
        m: ["Pulp Fiction", "Snatch"], b: ["Fight Club", "American Psycho"]
    },
    "MIX_MODERN_LOW": {
        tit: { tr: "Algoritma Kurbanı", en: "Algorithm Victim" },
        desc: {
            tr: "Spotify ne verirse onu yiyorsun. {a} sevdiğin için değil, listende olduğu için çaldı. Kendi iraden yok, yapay zeka ne derse o. {c} simülasyonunun en uyumlu parçasısın.",
            en: "Eating whatever Spotify serves. {a} played cuz it's listed, not loved. No will, AI rules you. Perfect fit for {c} simulation."
        },
        m: ["Social Network", "Her"], b: ["Filter Bubble", "Chaos Monkeys"]
    },
    "MIX_MODERN_HIGH": {
        tit: { tr: "Kaotik Z Kuşağı", en: "Chaotic Gen-Z" },
        desc: {
            tr: "Hyperpop, trap, metal... hepsi aynı listede. {a} dinledikten sonra ağlama krizine girip sonra partiliyorsun. {c} psikologları seni çözmeye çalışırken istifa edebilir.",
            en: "Hyperpop, trap, metal... all mixed. {a} makes you cry then party. {c} psychologists might quit trying to solve you."
        },
        m: ["Everything Everywhere", "Bodies Bodies Bodies"], b: ["No One Is Talking About This", "Severance"]
    },

    // --- SPECIALS (4) ---
    "METALHEAD": {
        tit: { tr: "Metalci", en: "Metalhead" },
        desc: {
            tr: "Simsiyah giyiniyorsun, için dışın karanlık. {a} senin için bir deşarj yöntemi değil, bir din. İnsanlar {c} parklarında yürürken sen Wall of Death hayal ediyorsun.",
            en: "All black everything. {a} isn't just venting, it's religion. While people walk in {c} parks, you dream of a Wall of Death."
        },
        m: ["Metal: Headbanger's Journey", "Lords of Chaos"], b: ["Lords of Chaos", "Choosing Death"]
    },
    "KPOP_STAN": {
        tit: { tr: "K-Pop Ordusu", en: "K-Pop Army" },
        desc: {
            tr: "Bias'ın için kurşun atar kurşun yersin. {a} hakkında tek bir kötü söz söyleyen olursa IP adresini bulursun. {c} senin bedenin, ruhun Kore'de.",
            en: "You'd take a bullet for your bias. Speak ill of {a}, you find their IP. Body in {c}, soul in Korea."
        },
        m: ["Blackpink: Light Up the Sky", "BTS: Burn the Stage"], b: ["K-Pop Confidential", "Shine"]
    },
    "JAZZ_CAT": {
        tit: { tr: "Caz Kedisi", en: "Jazz Cat" },
        desc: {
            tr: "Karmaşık akorlar, doğaçlama sololar... {a} dinlerken 'bunu anlamazsınız' bakışı atıyorsun. Aslında kimse anlamıyor, sen de dahil, ama olsun, havalı duruyor. {c} gecelerinde viski içip hüzünleniyorsun.",
            en: "Complex chords, improv solos... Giving 'you wouldn't get it' looks with {a}. Nobody gets it, including you, but looks cool. Sipping whiskey in {c} nights."
        },
        m: ["La La Land", "Whiplash"], b: ["But Beautiful", "Notes and Tones"]
    },
    "SWIFTIE": {
        tit: { tr: "Swiftie Muhafızı", en: "Swiftie Guard" },
        desc: {
            tr: "Eski sevgililerini sen de onunla birlikte gömdün. {a} senin hayat koçun. Şarkı sözlerindeki gizli mesajları çözmekten {c} hayatına odaklanamıyorsun. Bir tarikat üyesisin, kabul et.",
            en: "Buried exes with her. {a} is your life coach. Decoding lyrics logic prevents living in {c}. Admit it, you're in a cult."
        },
        m: ["Miss Americana", "Valentine's Day"], b: ["Seven Husbands of Evelyn Hugo", "Normal People"]
    }
};

// --- INIT & NAV ---
window.showScreen = function (screenId) {
    document.querySelectorAll('.screen').forEach(el => el.classList.remove('active-screen'));
    const target = document.getElementById(screenId);
    if (target) {
        target.classList.add('active-screen');
        window.scrollTo(0, 0);
    }
}

// --- SHARING ---
window.nativeShare = function () {
    const card = document.getElementById('final-summary-card');
    const bg = '#000000'; // Ensure black bg for consistency
    html2canvas(card, { scale: 2, useCORS: true, backgroundColor: bg }).then(canvas => {
        canvas.toBlob(async (blob) => {
            if (!blob) return alert('Görsel oluşturulamadı.');
            const file = new File([blob], 'Wrecked_Result.png', { type: 'image/png' });

            // Check if Web Share API supports file sharing
            if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
                try {
                    await navigator.share({
                        files: [file],
                        title: 'Wrecked: Müzik Karnesi',
                        text: 'Spotify geçmişim beni mahvetti... Sen de dene!'
                    });
                } catch (err) {
                    console.error('Share failed', err);
                    // Fallback to download if share dialog was closed or error
                }
            } else {
                // Fallback for desktop or unsupported browsers
                alert("Telefonunuz direkt paylaşımı desteklemiyor. Görsel indiriliyor...");
                downloadLink(canvas);
            }
        }, 'image/png');
    });
}

// --- SHARE LOGIC ---
function shareSocial(platform) {
    const text = "Spotify müzik zevkim mahvolmuş! Wrecked raporuma bak: wrecked-app.vercel.app #WreckedApp";
    const url = "https://wrecked-app.vercel.app";
    let intent = "";

    switch (platform) {
        case 'whatsapp':
            intent = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
            break;
        case 'twitter':
            intent = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
            break;
        case 'facebook':
            intent = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
            break;
        case 'instagram':
        case 'tiktok':
            // These platforms don't support direct web sharing well.
            // Fallback to native share or alert.
            if (navigator.share) {
                nativeShare();
                return;
            } else {
                alert("Instagram/TikTok paylaşımı için önce resmi indir, sonra uygulamadan paylaş!");
                downloadImage('generic');
                return;
            }
    }

    if (intent) {
        window.open(intent, '_blank');
    }
}

function downloadLink(canvas) {
    const a = document.createElement('a');
    a.download = 'Wrecked_2025_Result.png';
    a.href = canvas.toDataURL();
    a.click();
}

window.downloadImage = function () {
    const card = document.getElementById('final-summary-card');
    html2canvas(card, { scale: 2, useCORS: true, backgroundColor: '#000' }).then(canvas => {
        downloadLink(canvas);
        alert("Görsel indirildi! Galeri'den paylaşabilirsiniz.");
    });
}

document.addEventListener('DOMContentLoaded', () => {
    // LOGIN & START
    const btnLogin = document.getElementById('btn-login');
    if (btnLogin) btnLogin.addEventListener('click', startAuth);
    const btnStart = document.getElementById('btn-start');
    if (btnStart) btnStart.addEventListener('click', () => {
        const token = sessionStorage.getItem('access_token');
        if (!token) { showScreen('screen-login'); return; }
        showScreen('screen-songs');
        fetchData(token);
    });

    // NAVIGATION WIRING
    const bindNav = (btn, next) => {
        const b = document.getElementById(btn);
        if (b) b.addEventListener('click', () => showScreen(next));
    };
    bindNav('btn-next-albums', 'screen-albums');
    bindNav('btn-next-artists', 'screen-artists');
    bindNav('btn-next-genres', 'screen-genres');
    bindNav('btn-next-stats', 'screen-stats');

    const btnNextPersona = document.getElementById('btn-next-persona');
    if (btnNextPersona) btnNextPersona.addEventListener('click', () => {
        showScreen('screen-persona');
        generateFortune();
    });

    const btnNextSummary = document.getElementById('btn-next-summary');
    if (btnNextSummary) btnNextSummary.addEventListener('click', () => {
        showScreen('screen-summary');
        populateSummary();
    });

    const btnRestart = document.getElementById('btn-restart');
    if (btnRestart) btnRestart.addEventListener('click', () => {
        sessionStorage.clear();
        window.location.href = '/index.html';
    });

    // AUTH CALLBACK
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const token = sessionStorage.getItem('access_token');
    if (code) exchangeToken(code);
    else if (token) showScreen('screen-welcome');
    else showScreen('screen-login');
});

// --- AUTH ---
function generateRandomString(n) { let t = ''; const p = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'; for (let i = 0; i < n; i++) t += p.charAt(Math.floor(Math.random() * p.length)); return t; }
async function generateCodeChallenge(v) { const e = new TextEncoder().encode(v); const d = await window.crypto.subtle.digest('SHA-256', e); return btoa(String.fromCharCode(...new Uint8Array(d))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); }
async function startAuth() {
    const v = generateRandomString(128);
    sessionStorage.setItem('code_verifier', v);
    const c = await generateCodeChallenge(v);
    window.location.href = `https://accounts.spotify.com/authorize?response_type=code&client_id=${CLIENT_ID}&scope=${encodeURIComponent(SCOPES)}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&code_challenge_method=S256&code_challenge=${c}`;
}
function exchangeToken(code) {
    const v = sessionStorage.getItem('code_verifier');
    fetch('https://accounts.spotify.com/api/token', {
        method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ grant_type: 'authorization_code', code, redirect_uri: REDIRECT_URI, client_id: CLIENT_ID, code_verifier: v })
    }).then(async r => {
        if (!r.ok) {
            const txt = await r.text();
            throw new Error(`Token Hatası: ${r.status} - ${txt}`);
        }
        return r.json();
    }).then(d => {
        if (d.access_token) {
            sessionStorage.setItem('access_token', d.access_token);
            window.history.replaceState({}, document.title, '/index.html');
            showScreen('screen-welcome');
        } else {
            throw new Error('Access Token alınamadı via exchange.');
        }
    }).catch(e => {
        console.error("Auth Error:", e);
        alert("Giriş başarısız: " + e.message);
        showScreen('screen-login');
    });
}

// --- DATA ---
function fetchData(token) {
    document.getElementById('list-songs').innerHTML = '<p>Veriler Yükleniyor...</p>';
    fetch('https://api.spotify.com/v1/me/top/tracks?limit=50&time_range=long_term', { headers: { 'Authorization': 'Bearer ' + token } })
        .then(async r => {
            if (r.status === 401) {
                alert("Oturum süresi dolmuş. Lütfen tekrar giriş yapın.");
                sessionStorage.clear();
                window.location.href = '/index.html';
                throw new Error("Token expired");
            }
            if (!r.ok) {
                const err = await r.text();
                throw new Error(`API Hatası: ${r.status} - ${err}`);
            }
            return r.json();
        }).then(d => {
            allTopTracks = d.items || [];
            if (allTopTracks.length === 0) {
                // Fallback or just continue? Continue but warn?
                console.warn("No tracks found");
            }
            renderSongs(allTopTracks.slice(0, 10));
            calculateAlbums(allTopTracks);
            calculateMusicEra(allTopTracks);
            return fetch('https://api.spotify.com/v1/me/top/artists?limit=50&time_range=long_term', { headers: { 'Authorization': 'Bearer ' + token } });
        }).then(async r => {
            if (r.status === 401) {
                // Should have been caught above, but just in case
                sessionStorage.clear();
                window.location.href = '/index.html';
                throw new Error("Token expired");
            }
            if (!r.ok) throw new Error(`Artist API Hatası: ${r.status}`);
            return r.json();
        }).then(d => {
            allTopArtists = d.items || [];
            renderArtists(allTopArtists.slice(0, 10));
            calculateGenres(allTopArtists);
            calculateVariety(allTopArtists);
            calculateWreckedStats(allTopArtists);
            updateStats();
        }).catch(e => {
            console.error(e);
            if (e.message !== "Token expired") {
                alert("Veri hatası: " + e.message);
            }
        });
}

// --- LOGIC ---
function renderSongs(t) { document.getElementById('list-songs').innerHTML = t.map((x, i) => `<div class="item"><img src="${x.album.images[0]?.url}"><div><div><span class="rank">#${i + 1}</span> <b>${x.name}</b></div><div>${x.artists[0].name}</div></div></div>`).join(''); }
function renderArtists(a) { document.getElementById('list-artists').innerHTML = a.map((x, i) => `<div class="item"><img src="${x.images[0]?.url}"><div><div><span class="rank">#${i + 1}</span> <b>${x.name}</b></div></div></div>`).join(''); }
function calculateAlbums(tracks) {
    const c = {}; const i = {};
    tracks.forEach(t => { c[t.album.name] = (c[t.album.name] || 0) + 1; i[t.album.name] = t.album; });
    document.getElementById('list-albums').innerHTML = Object.entries(c).sort((a, b) => b[1] - a[1]).slice(0, 10).map((x, idx) => `<div class="item"><img src="${i[x[0]].images[0]?.url}"><div><div><span class="rank">#${idx + 1}</span> <b>${x[0]}</b></div></div></div>`).join('');
}
function calculateGenres(artists) {
    const c = {}; artists.forEach(a => a.genres.forEach(g => c[g] = (c[g] || 0) + 1));
    const sorted = Object.entries(c).sort((a, b) => b[1] - a[1]);
    topGenres = sorted.map(x => x[0]);
    // Fix for user: Try to show at least 10 if available
    let limit = sorted.length < 10 ? sorted.length : 10;
    document.getElementById('list-genres').innerHTML = sorted.slice(0, limit).map((x, i) => `<div class="item"><span class="rank">#${i + 1}</span> <b>${formatGenre(x[0])}</b></div>`).join('');

    // Group logic matches v10
    const m = topGenres[0] || '';
    if (m.includes('rock') || m.includes('metal')) dominantGenreGroup = "ROCK";
    else if (m.includes('pop') || m.includes('dance')) dominantGenreGroup = "POP";
    else if (m.includes('hip') || m.includes('rap')) dominantGenreGroup = "URBAN";
    else if (m.includes('elect') || m.includes('edm')) dominantGenreGroup = "ELECTRO";
    else if (m.includes('indie') || m.includes('folk')) dominantGenreGroup = "INDIE";
    else dominantGenreGroup = "MIX";
}
// --- LOGIC: SPIRIT AGE ---
function calculateMusicEra(t) {
    let y = 0, c = 0; t.forEach(x => { let yr = parseInt(x.album.release_date.split('-')[0]); if (!isNaN(yr)) { y += yr; c++; } });
    const avg = c ? Math.round(y / c) : 2020;
    musicEra = avg < 1980 ? "OLD" : avg < 2010 ? "RETRO" : "MODERN";

    // Detailed Spirit Age (10 Types) - TR & EN
    if (avg < 1965) { detailedSpiritAge = "Taş Plak"; detailedSpiritAgeEN = "Vinyl Era"; }
    else if (avg < 1975) { detailedSpiritAge = "Çiçek Çocuk"; detailedSpiritAgeEN = "Flower Power"; }
    else if (avg < 1985) { detailedSpiritAge = "Analog Ruh"; detailedSpiritAgeEN = "Analog Soul"; }
    else if (avg < 1995) { detailedSpiritAge = "Neon Nostaljik"; detailedSpiritAgeEN = "Neon Nostalgic"; }
    else if (avg < 2005) { detailedSpiritAge = "Milenyum Çocuğu"; detailedSpiritAgeEN = "Millennial"; }
    else if (avg < 2010) { detailedSpiritAge = "Emo Dönemi"; detailedSpiritAgeEN = "Emo Phase"; }
    else if (avg < 2015) { detailedSpiritAge = "Tumblr Genci"; detailedSpiritAgeEN = "Tumblr Teen"; }
    else if (avg < 2020) { detailedSpiritAge = "Streaming Yerlisi"; detailedSpiritAgeEN = "Streaming Native"; }
    else if (avg < 2023) { detailedSpiritAge = "Karantina Mezunu"; detailedSpiritAgeEN = "Quarantine Grad"; }
    else { detailedSpiritAge = "Fütürist"; detailedSpiritAgeEN = "Futurist"; }
}

function calculateVariety(a) {
    const u = new Set(); a.forEach(x => x.genres.forEach(g => u.add(g)));
    varietyScore = (a.length && u.size / a.length > 0.8) ? "HIGH" : "LOW";
}

// --- LOGIC: TOXIC TRAIT ---
function calculateWreckedStats(artists) {
    let p = 0; artists.forEach(a => p += a.popularity); mainstreamScore = artists.length ? Math.round(p / artists.length) : 50;

    // Helper for bilingual traits
    const setTrait = (tr, en) => { toxicTrait = tr; toxicTraitEN = en; };

    // 1. Artist Specific
    const topArt = artists[0] ? artists[0].name : "";
    if (topArt === 'Taylor Swift') setTrait("Swiftie Muhafızı", "Swiftie Guard");
    else if (topArt === 'Kanye West') setTrait("Yanlış Anlaşılan Dahi", "Misunderstood Genius");
    else if (topArt === 'The Weeknd') setTrait("Toksik Ex", "Toxic Ex");
    else if (topArt === 'Lana Del Rey') setTrait("Profesyonel Ağlak", "Pro Weeper");
    else if (['BTS', 'Blackpink', 'Stray Kids'].includes(topArt)) setTrait("Army Üyesi", "Army Member");

    // 2. Genre Specific
    else if (dominantGenreGroup === 'METAL') setTrait("Duş Almayan", "Shower Avoider");
    else if (dominantGenreGroup === 'JAZZ') setTrait("Asansör Müzisyeni", "Elevator Musician");
    else if (['Bach', 'Mozart', 'Beethoven'].some(x => topArt.includes(x))) setTrait("Sahte Entelektüel", "Fake Intellectual");
    else if (topGenres.some(g => g.includes('soundtrack'))) setTrait("Hayatını Film Sanan", "Main Character Syndrome");
    else if (topGenres.some(g => g.includes('reggaeton'))) setTrait("Yazlıkçı", "Summer Vibe");
    else if (topGenres.some(g => g.includes('techno'))) setTrait("Haftasonu Savaşçısı", "Weekend Warrior");
    else if (topGenres.some(g => g.includes('arabesk'))) setTrait("Acıların Çocuğu", "Drama King/Queen");

    // 3. General Stats
    else if (mainstreamScore > 90) setTrait("Radyo Zombisi", "Radio Zombie");
    else if (mainstreamScore < 15) setTrait("Zorlama Hipster", "Forced Hipster");
    else if (detailedSpiritAge === "Emo Dönemi") setTrait("Eski Emo", "Ex-Emo");
    else if (musicEra === "OLD") setTrait("Nostalji Bağımlısı", "Nostalgia Addict");
    else if (varietyScore === "HIGH") setTrait("Kararsız Ruh Hastası", "Indecisive Psycho");
    else if (artists.length < 5) setTrait("Müzik Dinlemeyen", "Music Hater");
    else if (dominantGenreGroup === "POP") setTrait("Gizli Fan", "Closet Fan");
    else setTrait("Ortalama İnsan", "Average Joe");
}

// --- GENRE FORMATTER ---
function formatGenre(g) {
    if (!g) return "";
    // Custom replacements for common data
    if (g === 'turkish pop') return currentLang === 'tr' ? 'TÜRKÇE POP' : 'TURKISH POP';
    if (g === 'turkish rock') return currentLang === 'tr' ? 'TÜRKÇE ROCK' : 'TURKISH ROCK';

    // Default capitalize
    return g.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

function updateStats() {
    const elEra = document.getElementById('stat-era');
    const eraVal = currentLang === 'tr' ? detailedSpiritAge : detailedSpiritAgeEN;
    if (elEra) elEra.innerText = eraVal || (currentLang === 'tr' ? "Bilinmiyor" : "Unknown");

    const elMain = document.getElementById('stat-mainstream-val');
    const elBar = document.getElementById('stat-mainstream-bar');
    if (elMain) {
        elMain.innerText = mainstreamScore + "%";
        elBar.style.width = mainstreamScore + "%";
    }

    const tG = topGenres[0] || '';
    // Use formatter instead of just uppercase
    document.getElementById('stat-top-genre').innerText = formatGenre(tG) || (currentLang === 'tr' ? "YOK" : "NONE");

    const traitVal = currentLang === 'tr' ? toxicTrait : toxicTraitEN;
    document.getElementById('stat-toxic').innerText = traitVal || (currentLang === 'tr' ? "Sıradan" : "Ordinary");

    document.getElementById('stat-artist-count').innerText = allTopArtists.length || 0;
    document.getElementById('stat-genre-count').innerText = topGenres.length || 0;

    // City logic (Simplified for length - could be expanded to bilingual if cities were text, but names are mostly universal)
    // Actually, names like "Viyana" vs "Vienna" exist. Let's do a simple mapping or just use EN names as universal "Cool" factors?
    // User didn't explicitly ask for city translation, but let's be safe and generic or English for cities.
    // I'll leave City names as they are (mostly English/Universal) or simple.
    // Re-calculating city just to be sure
    const m = topGenres[0] || '';
    let city = "Yozgat"; // Fallback humor
    if (m.includes('pop')) city = "Los Angeles";
    else if (m.includes('rock')) city = "Seattle";
    else if (m.includes('indie')) city = "Portland";
    else if (m.includes('metal')) city = "Helsinki";
    else if (m.includes('rap') || m.includes('hip hop')) city = "Atlanta";
    else if (m.includes('jazz')) city = "New Orleans";
    else if (m.includes('classical')) city = "Vienna";
    else if (m.includes('electronic') || m.includes('house')) city = "Berlin";
    else if (m.includes('k-pop')) city = "Seoul";
    else if (m.includes('country') || m.includes('folk')) city = "Nashville";
    else if (m.includes('latin') || m.includes('reggaeton')) city = "Mexico City";
    else if (m.includes('r&b')) city = "Toronto";
    else if (m.includes('bossa')) city = "Rio";
    else if (m.includes('punk')) city = "London";
    else if (m.includes('anime')) city = "Tokyo";
    else if (m.includes('french')) city = "Paris";
    else if (m.includes('techno')) city = "Berlin";
    else if (m.includes('psychedelic')) city = "San Francisco";
    else if (m.includes('trap')) city = "Compton";
    else if (m.includes('arabesk') || m.includes('turkish')) city = "Ankara";

    document.getElementById('stat-city').innerText = city;
}

// --- PERSONA & SUMMARY ---
function populateSummary() {
    // 1. Sync Image
    if (allTopArtists[0]?.images[0]) document.getElementById('sum-artist-img').src = allTopArtists[0].images[0].url;

    // 2. Sync Text Content (Redundancy for safety)
    const personaTitle = document.getElementById('persona-title').innerText;
    document.getElementById('sum-title').innerText = personaTitle;
    document.getElementById('sum-story').innerHTML = document.getElementById('persona-desc').innerHTML;

    // 3. Stats Sync
    document.getElementById('sum-era').innerText = currentLang === 'tr' ? detailedSpiritAge : detailedSpiritAgeEN;
    document.getElementById('sum-score').innerText = mainstreamScore + "%"; // Removed 'Banal' text to match screenshot clean look
    document.getElementById('sum-bar').style.width = mainstreamScore + "%";

    const tG = topGenres[0] || '';
    document.getElementById('sum-top-genre').innerText = formatGenre(tG);

    document.getElementById('sum-toxic').innerText = currentLang === 'tr' ? toxicTrait : toxicTraitEN;
    document.getElementById('sum-art-count').innerText = allTopArtists.length;
    document.getElementById('sum-gen-count').innerText = topGenres.length;
    document.getElementById('sum-city').innerText = document.getElementById('stat-city').innerText;

    // 4. Recs Sync
    if (currentPersona) {
        document.getElementById('sum-rec-mov').innerHTML = currentPersona.m.map(x => `<p>• ${x}</p>`).join('');
        document.getElementById('sum-rec-book').innerHTML = currentPersona.b.map(x => `<p>• ${x}</p>`).join('');
    }
}

// --- GENERATE FORTUNE (New Bilingual Logic) ---
function generateFortune() {
    // 1. Identify Priority/Special Archetypes
    let key = `${dominantGenreGroup}_${musicEra}_${varietyScore}`;
    const topArt = allTopArtists[0] ? allTopArtists[0].name : "";
    const topGen = topGenres[0] || "";

    if (topArt === 'Taylor Swift') key = 'SWIFTIE';
    else if (topGen.includes('k-pop') || topArt.includes('BTS')) key = 'KPOP_STAN';
    else if (dominantGenreGroup === 'METAL' || topGen.includes('metal')) key = 'METALHEAD';
    else if (dominantGenreGroup === 'JAZZ') key = 'JAZZ_CAT';

    // 2. Fallback Logic
    if (!ARCHETYPES_DB[key]) {
        if (ARCHETYPES_DB[`${dominantGenreGroup}_${musicEra}_LOW`]) key = `${dominantGenreGroup}_${musicEra}_LOW`;
        else if (ARCHETYPES_DB[`${dominantGenreGroup}_MODERN_LOW`]) key = `${dominantGenreGroup}_MODERN_LOW`;
        else key = "MIX_MODERN_LOW"; // Ultimate fallback
    }

    const persona = ARCHETYPES_DB[key] || ARCHETYPES_DB['MIX_MODERN_LOW'];
    currentPersona = persona;

    // 3. Prepare Text (Bilingual)
    // Get raw text based on language
    const lang = currentLang;
    let rawTitle = persona.tit ? (persona.tit[lang] || persona.tit['tr']) : "Unknown";
    let rawDesc = persona.desc ? (persona.desc[lang] || persona.desc['tr']) : "Error generating story.";

    // 4. Inject Dynamic Data
    const cityVal = document.getElementById('stat-city').innerText || (currentLang === 'tr' ? "İstanbul" : "New York");
    const artVal = topArt || "Sanatçı";

    // Replace {a} and {c}
    let finalDesc = rawDesc.replace(/\{a\}/g, `<strong>${artVal}</strong>`).replace(/\{c\}/g, `<strong>${cityVal}</strong>`);

    generatedFortunText = finalDesc;

    // 5. Update UI
    document.getElementById('persona-title').innerText = rawTitle;
    document.getElementById('persona-desc').innerHTML = finalDesc;

    const moviesList = document.getElementById('rec-movies');
    if (moviesList) moviesList.innerHTML = persona.m.map(x => `<li>${x}</li>`).join('');

    const booksList = document.getElementById('rec-books');
    if (booksList) booksList.innerHTML = persona.b.map(x => `<li>${x}</li>`).join('');

    // Summary Card Sync
    document.getElementById('sum-title').innerText = rawTitle;

    // TRUNCATE STORY FOR SUMMARY CARD TO PREVENT OVERFLOW
    // Keep it approx 130 chars for visual fit
    let shortDesc = finalDesc;
    if (finalDesc.length > 140) {
        // Find last space before 140
        const cut = finalDesc.lastIndexOf(' ', 140);
        shortDesc = finalDesc.substring(0, cut > 0 ? cut : 140) + "...";
    }
    document.getElementById('sum-story').innerHTML = shortDesc;

    document.getElementById('sum-era').innerText = (currentLang === 'tr' ? detailedSpiritAge : detailedSpiritAgeEN) || "MODERN";
    document.getElementById('sum-score').innerText = mainstreamScore + "% " + (currentLang === 'tr' ? "Banal" : "Basic");
    document.getElementById('sum-bar').style.width = mainstreamScore + "%";
    document.getElementById('sum-top-genre').innerText = (topGenres[0] || 'POP').toUpperCase();
    document.getElementById('sum-toxic').innerText = (currentLang === 'tr' ? toxicTrait : toxicTraitEN) || "OK";
    document.getElementById('sum-city').innerText = cityVal;

    // Summary Recs - Hidden by CSS but populate just in case
    document.getElementById('sum-rec-mov').innerHTML = "";
    document.getElementById('sum-rec-book').innerHTML = "";

    if (!persona.b || persona.b.length === 0) document.getElementById('rec-books').innerHTML = "<li>Kitap yok.</li>";
}

function populateSummary() {
    // Basic image sync
    if (allTopArtists[0]?.images[0]) document.getElementById('sum-artist-img').src = allTopArtists[0].images[0].url;

    // Most text population is done in generateFortune to respect Dynamic Placeholders and Language
    // Just ensuring counters are here
    document.getElementById('sum-art-count').innerText = allTopArtists.length;
    document.getElementById('sum-gen-count').innerText = topGenres.length;
}

window.onload = () => {
    // 1. Language Init
    updateDomTexts();
    const btnLang = document.getElementById('btn-lang');
    if (btnLang) btnLang.onclick = toggleLanguage;

    // 2. Auth Check
    const hash = window.location.hash;
    if (hash) {
        const token = new URLSearchParams(hash.substring(1)).get('access_token');
        if (token) {
            window.location.hash = '';
            document.getElementById('screen-login').classList.remove('active-screen');
            showScreen('screen-welcome');
            fetchSpotifyData(token);
        }
    }

    document.getElementById('btn-login').onclick = () => {
        const url = `https://accounts.spotify.com/authorize?client_id=${CLIENT_ID}&response_type=token&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=${encodeURIComponent(SCOPES)}`;
        window.location.href = url;
    };

    document.getElementById('btn-start').onclick = () => showScreen('screen-songs');
    document.getElementById('btn-next-albums').onclick = () => showScreen('screen-albums');
    document.getElementById('btn-next-artists').onclick = () => showScreen('screen-artists');
    document.getElementById('btn-next-genres').onclick = () => showScreen('screen-genres');

    document.getElementById('btn-next-stats').onclick = () => {
        updateStats();
        showScreen('screen-stats');
    };

    document.getElementById('btn-next-persona').onclick = () => {
        generateFortune();
        showScreen('screen-persona');
        populateSummary(); // call for image
    };

    document.getElementById('btn-next-summary').onclick = () => {
        populateSummary();
        showScreen('screen-summary');

        // Auto-scroll for mobile UX
        setTimeout(() => {
            document.getElementById('screen-summary').scrollIntoView({ behavior: 'smooth' });
        }, 100);
    };

    document.getElementById('btn-restart').onclick = () => {
        window.location.href = REDIRECT_URI;
    };
};
