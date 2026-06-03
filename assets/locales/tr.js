/* Türkçe — kontrol eden: ____  (kontrol ettikten sonra adını yaz) */
window.SS_I18N = window.SS_I18N || {};
window.SS_I18N.tr = {
  nav_tool: 'Araç', nav_how: 'Nasıl çalışır', nav_learn: 'Daha fazla bilgi',
  theme_toggle: 'Koyu modu değiştir',

  hero_eyebrow: 'Araştırma Prototipi · TU/e Grup 5',
  hero_title: 'Tükürük spektrumlarından <em>girişimsel olmayan</em> diyabet taraması',
  hero_desc: 'Bir tükürük örneğinin ATR-FTIR kızılötesi spektrumunu yükleyin ve Tip 2 diyabet riski için anında makine öğrenmesi tabanlı bir tarama tahmini alın.',
  hero_disclaimer: 'Bu araç yalnızca bir araştırma prototipidir. Tıbbi tanı koymaz. Daima bir sağlık uzmanına danışın.',
  stat_samples: 'Eğitim örnekleri', stat_method: 'Spektroskopi yöntemi', stat_task: 'Sınıflandırma görevi',

  model_loading: 'Yapay zekâ modeli yükleniyor…', model_ready: 'Yapay zekâ modeli hazır.',
  model_error: 'Model yüklenemedi.',
  model_wait: 'Model hâlâ yükleniyor — lütfen biraz bekleyin.',
  retry: 'Tekrar dene',

  tool_eyebrow: 'Spektrum Çözümleyici', tool_title: 'Spektrum dosyanızı yükleyin',
  tool_subtitle: 'Kabul edilen biçimler: CSV (dalga sayısı, soğurma sütunları) veya 399–4000 cm⁻¹ aralığında soğurma değerlerinden oluşan bir JSON dizisi.',
  upload_title: 'Dosyayı buraya bırakın veya tıklayıp seçin',
  upload_sub: 'Dosyanız tarayıcınızdan asla çıkmaz — hiçbir şey yüklenmez veya saklanmaz.',
  btn_analyze: 'Spektrumu Çözümle',
  result_label: 'Tarama Sonucu', confidence_label: 'Güven puanı',
  meta_points: 'Spektral nokta', meta_range: 'Dalga sayısı aralığı', meta_model: 'Model',
  chart_title: 'Yüklenen kızılötesi spektrum',
  result_disclaimer: 'Bu sonuç, 1.040 ATR-FTIR tükürük spektrumuyla eğitilmiş bir araştırma modelinden gelir. Klinik bir tanı değildir. Tükürük bileşimi beslenme, su alımı ve ağız sağlığından etkilenir. Uygun bir test için bir sağlık uzmanına danışın.',
  low_risk: 'Düşük Tip 2 diyabet riski saptandı',
  high_risk: 'Yüksek risk — lütfen bir doktora danışın',
  medium_risk: 'Belirsiz — takip önerilir',

  how_eyebrow: 'Süreç', how_title: 'Nasıl çalışır?',
  how_subtitle: 'Tükürük örneğinden sonuca dört adımda.',
  step1_title: 'Tükürük toplama', step1_desc: 'Açken küçük bir tükürük örneği alınır. İğne yok, kan yok.',
  step2_title: 'ATR-FTIR taraması', step2_desc: 'Örnek, moleküler parmak izini yakalamak için kızılötesi spektroskopiyle taranır.',
  step3_title: 'Spektrumu yükle', step3_desc: 'Spektrumu CSV veya JSON dosyası olarak dışa aktarın ve buraya yükleyin.',
  step4_title: 'Yapay zekâ taraması', step4_desc: 'Sinir ağı spektral deseni çözümler ve bir risk güven puanı üretir.',

  edu_eyebrow: 'Tip 2 Diyabet — Daha Fazla', edu_title: 'Tip 2 Diyabeti Anlamak',
  learn_more: 'Devamını oku →',
  edu1_title: 'Tip 2 diyabet nedir?', edu1_desc: 'Vücudun insülini etkili kullanamadığı, kan şekerini yükselten kronik bir hastalıktır. Dünya genelindeki diyabet vakalarının %90\'ından fazlasını oluşturur.',
  edu2_title: 'Risk faktörleri', edu2_desc: 'Fazla kilo, hareketsizlik, ailede diyabet öyküsü, 45 yaş üstü ve geçmiş gebelik diyabeti. Yaşam tarzı değişiklikleri riski azaltır.',
  edu3_title: 'Neden tükürük?', edu3_desc: 'Tükürük, metabolik değişimlerin biyokimyasal izlerini taşır. ATR-FTIR, diyabetli ve diyabetsiz tükürük arasındaki moleküler farkları saptayabilir.',
  edu4_title: 'Önleme', edu4_desc: 'Düzenli hareket (haftada 150 dk), dengeli ve az şekerli beslenme, sağlıklı kilo ve sigara içmemek riski belirgin ölçüde azaltır.',
  edu5_title: 'Bu araç hakkında', edu5_desc: 'SEDENA tükürük veri kümesiyle (Meksika) eğitilmiş, TU/e çok disiplinli CBL prototipidir. Sertifikalı bir tıbbi cihaz değildir.',
  edu6_title: 'Doğru şekilde test olun', edu6_desc: 'Resmî tarama açlık kan şekeri (≥126 mg/dL) veya HbA1c (≥%6,5) kullanır. Endişeliyseniz hekiminize başvurun — erken tanı yardımcı olur.',

  footer_note: 'Araştırma prototipi — tıbbi cihaz değildir. Yalnızca eğitim amaçlıdır.',

  learn_hub_title: 'Daha fazla bilgi', learn_hub_sub: 'Arka plan okumaları, aracın arkasındaki bilim ve seçilmiş kaynaklar.',
  learn_back: '← Araca dön',
  res_title: 'Kaynaklar', res_sub: 'Derinleşmek için seçilmiş videolar ve makaleler.'
};
