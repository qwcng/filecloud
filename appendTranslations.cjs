const fs = require('fs');
const path = require('path');

const localesPath = 'c:/Users/Krzysiek/Desktop/laravel/filecloud/public/locales';

const newTranslations = {
  "en": {
    "title": "Your Drive",
    "usedOf": "{{used}} GB used of {{total}} GB",
    "freePercent": "{{percent}}% free",
    "type": {
        "image": "Images",
        "video": "Videos",
        "audio": "Audio",
        "document": "Documents",
        "text": "Text Files",
        "other": "Other",
        "free": "Free Space"
    }
  },
  "pl": {
    "title": "Twój Dysk",
    "usedOf": "{{used}} GB zajęte z {{total}} GB",
    "freePercent": "{{percent}}% wolnego",
    "type": {
        "image": "Zdjęcia",
        "video": "Wideo",
        "audio": "Audio",
        "document": "Dokumenty",
        "text": "Tekstowe",
        "other": "Inne",
        "free": "Wolne Miejsce"
    }
  },
  "de": {
    "title": "Dein Speicher",
    "usedOf": "{{used}} GB belegt von {{total}} GB",
    "freePercent": "{{percent}}% frei",
    "type": {
        "image": "Bilder",
        "video": "Videos",
        "audio": "Audio",
        "document": "Dokumente",
        "text": "Textdateien",
        "other": "Andere",
        "free": "Freier Speicherplatz"
    }
  },
  "es": {
    "title": "Tu Unidad",
    "usedOf": "{{used}} GB usados de {{total}} GB",
    "freePercent": "{{percent}}% libre",
    "type": {
        "image": "Imágenes",
        "video": "Videos",
        "audio": "Audio",
        "document": "Documentos",
        "text": "Archivos de texto",
        "other": "Otros",
        "free": "Espacio libre"
    }
  },
  "fr": {
    "title": "Votre Disque",
    "usedOf": "{{used}} Go utilisés sur {{total}} Go",
    "freePercent": "{{percent}}% libre",
    "type": {
        "image": "Images",
        "video": "Vidéos",
        "audio": "Audio",
        "document": "Documents",
        "text": "Fichiers texte",
        "other": "Autres",
        "free": "Espace libre"
    }
  },
  "it": {
    "title": "Il tuo Drive",
    "usedOf": "{{used}} GB usati su {{total}} GB",
    "freePercent": "{{percent}}% libero",
    "type": {
        "image": "Immagini",
        "video": "Video",
        "audio": "Audio",
        "document": "Documenti",
        "text": "File di testo",
        "other": "Altro",
        "free": "Spazio libero"
    }
  },
  "ru": {
    "title": "Ваш диск",
    "usedOf": "Занято {{used}} ГБ из {{total}} ГБ",
    "freePercent": "{{percent}}% свободно",
    "type": {
        "image": "Изображения",
        "video": "Видео",
        "audio": "Аудио",
        "document": "Документы",
        "text": "Текстовые",
        "other": "Другое",
        "free": "Свободно"
    }
  },
  "ja": {
    "title": "マイドライブ",
    "usedOf": "{{total}} GB中 {{used}} GB使用中",
    "freePercent": "空き容量 {{percent}}%",
    "type": {
        "image": "画像",
        "video": "動画",
        "audio": "音声",
        "document": "ドキュメント",
        "text": "テキスト",
        "other": "その他",
        "free": "空き容量"
    }
  },
  "zh": {
    "title": "您的云盘",
    "usedOf": "已用 {{used}} GB，共 {{total}} GB",
    "freePercent": "可用 {{percent}}%",
    "type": {
        "image": "图片",
        "video": "视频",
        "audio": "音频",
        "document": "文档",
        "text": "文本",
        "other": "其他",
        "free": "可用空间"
    }
  },
  "he": {
    "title": "הכונן שלך",
    "usedOf": "בשימוש {{used}} GB מתוך {{total}} GB",
    "freePercent": "{{percent}}% פנוי",
    "type": {
        "image": "תמונות",
        "video": "סרטונים",
        "audio": "שמע",
        "document": "מסמכים",
        "text": "קבצי טקסט",
        "other": "אחר",
        "free": "מקום פנוי"
    }
  },
  "ar": {
    "title": "محرك الأقراص الخاص بك",
    "usedOf": "تم استخدام {{used}} غيغابايت من أصل {{total}} غيغابايت",
    "freePercent": "مساحة فارغة {{percent}}%",
    "type": {
        "image": "صور",
        "video": "فيديوهات",
        "audio": "صوتيات",
        "document": "مستندات",
        "text": "ملفات نصية",
        "other": "أخرى",
        "free": "مساحة فارغة"
    }
  }
};

const dirs = fs.readdirSync(localesPath);

dirs.forEach(lang => {
    const filePath = path.join(localesPath, lang, 'translation.json');
    if (fs.existsSync(filePath)) {
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        try {
            const parsed = JSON.parse(fileContent);
            parsed.storage_dashboard = newTranslations[lang] || newTranslations['en'];
            
            fs.writeFileSync(filePath, JSON.stringify(parsed, null, 4));
            console.log(`Updated ${lang}/translation.json`);
        } catch (e) {
            console.error(`Error processing ${lang}:`, e.message);
        }
    }
});
