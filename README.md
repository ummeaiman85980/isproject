# Email Spam Classifier

Bu uygulama, FastAPI kullanarak bir API sağlayan ve sklearn ile geliştirilen makine öğrenmesi modelini temel alan bir spam sınıflandırma projesidir. Arayüz üzerinden kullanıcılara kolay bir deneyim sunar.

Eğitim dosyasına `train.py` üzerinden erişebilirsiniz. Scikit-Learn kütüphanesi ile Naive-Bayes sınıflandırma algoritmasını kullanarak 
bir model oluşturdum. Tabii ki öncelikle text'i formatladım. Her bir harfini küçültme, stem işlemi uygulama ve stopwords'lerin filtrelenmesi gibi. Ardından TfidfVectorizer ile modelin anlayabileceği şekilde vektörize ettim yani sayısallaştırdım. Ardından modeli eğitip pickle ile pkl formatında model dosyası olarak kaydettim. API çalışmadan önce bu pkl dosyasını okuyup eğitilmiş model'e erişebilmektedir. TfidfVectorizer'da kendi içerisinde bir algoritmaya sahiptir bu algoritmayı kaybetmemek için aynı şekilde pkl formatında kayıt edip, api dosyasında bu pkl dosyasını `vectorizer` olarak okuyorum.

API kısmında ise `FASTAPI` kullandım. `/predict` endpointine atılan `POST` işlemi ile cevap olarak hem label hem de doğruluk yüzdesini döndürüyorum. Burada pickle ile pkl dosyalarını(model ve vectorizer) okuyorum. Predict fonksiyonuna gelen istekte önce vectorizer ile vektörleştirip ardından model ile predict etmesini sağlıyorum ve cevap döndürüyorum. Prediction Proba ile de en yüksek doğruluğa sahip olan label'in doğruluk oranını elde ediyorum.

## Kurulum

1. FastAPI ve gerekli kütüphaneleri yükleyin:  
    ```bash
    pip install -r requirements.txt
    ```
2. Python dosyasını çalıştırın:  
    ```bash
    python3 api.py
    ```
3. Arayüz için:
   ```
   Live Server eklentisini indirin ve index.html dosyasına sağ tıklayıp Open With Live Server'a basın.
   ```

## Kullanım

- Arayüz üzerinden bir e-posta metni girebilir ve spam olup olmadığını öğrenebilirsiniz.  
- API ile sorgu yaparak ham metinleri sınıflandırabilirsiniz.

## Sistem Arayüz Fotoğrafı

![UI](/static/screenshot.png)