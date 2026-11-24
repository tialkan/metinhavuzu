# Etiketler (UD, CoNLL-U)

Sitedeki etiketleme ekranından (`#/etiketler`) indirilen CoNLL-U dosyaları buraya konur. Site sunucusuz çalıştığı için taslaklar yalnız etiketleyicinin tarayıcısında durur; kalıcı kayıt bu klasördür.

Dosya adı: `metinhavuzu-etiketler-<etiketleyici>-<tarih>.conllu` (ekran bu adı kendisi verir).

Her cümlenin başlığında: `sent_id` (tanığın kalıcı kimliği), `kaynak_satirlar` (cümleyi oluşturan satırlar), `etiketleyici`, `tarih`, `kilavuz` (kilavuz/KARARLAR.md sürümü). Proje alanları MISC sütununda: `YonetilenHal`, `YuzeyIsaret`, `Okuma`, `Not`.

Uyuşma: iki etiketleyicinin dosyaları ekranın “Uyuşma” bölümüne yüklenir; UAS, LAS ve UPOS / ilişki / hâl için Cohen κ hesaplanır. Pilot hedefi en az 30 cümle (ORKESTRATOR.md, “Güvenilirlik”).
