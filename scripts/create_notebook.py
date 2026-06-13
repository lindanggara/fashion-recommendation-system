import nbformat as nbf

nb = nbf.v4.new_notebook()

cells = []

# â”€â”€ CELL 0 : Judul â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
cells.append(nbf.v4.new_markdown_cell("""# Sistem Rekomendasi Produk Fashion untuk Mendukung Strategi Merchandising Menggunakan Hybrid Recommendation System
## Studi Kasus: H&M Personalized Fashion Recommendations

**Nama:** Linda Anggara Wati  
**NRP:** 3324600008  
**Mata Kuliah:** Sistem Rekomendasi  
**Semester Genap TA. 2025/2026**

---
### Kaitan SDGs 9 â€” Industri, Inovasi, dan Infrastruktur
Penelitian ini berkontribusi pada SDGs 9 melalui penerapan machine learning untuk meningkatkan efisiensi operasional industri tekstil. Sistem rekomendasi ini membantu industri fashion mengurangi overstock, mengoptimalkan rantai pasok, dan meningkatkan daya saing melalui inovasi digital â€” selaras dengan target SDGs 9.2 dan 9.5.
"""))

# â”€â”€ CELL 1 : Install â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
cells.append(nbf.v4.new_markdown_cell("## 0. Install & Import Library"))
cells.append(nbf.v4.new_code_cell("""\
# Install library yang dibutuhkan
# !pip install scikit-surprise pandas numpy matplotlib seaborn scikit-learn joblib

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from surprise import SVD, Dataset, Reader
from surprise.model_selection import cross_validate
import joblib
import warnings
warnings.filterwarnings('ignore')

print("âœ… Semua library berhasil diimport")
"""))

# â”€â”€ CELL 2 : Load Data â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
cells.append(nbf.v4.new_markdown_cell("""## 1. Pengumpulan Dataset H&M
Dataset: H&M Personalized Fashion Recommendations (Kaggle, 2022)
- `articles.csv` â€” 105.542 produk fashion
- `customers.csv` â€” 1.371.980 customer
- `transactions_train.csv` â€” 31.788.324 transaksi (Sep 2018â€“Sep 2020)
"""))
cells.append(nbf.v4.new_code_cell("""\
print("Loading dataset...")

articles  = pd.read_csv('articles.csv')
customers = pd.read_csv('customers.csv')

# Load semua transaksi untuk stratified sampling
transactions_full = pd.read_csv(
    'transactions_train.csv',
    dtype={'article_id': str, 'customer_id': str}
)
transactions_full['t_dat'] = pd.to_datetime(transactions_full['t_dat'])

print(f"Articles     : {articles.shape}")
print(f"Customers    : {customers.shape}")
print(f"Transactions : {transactions_full.shape}")
print(f"\\nPeriode transaksi: {transactions_full['t_dat'].min()} s/d {transactions_full['t_dat'].max()}")
"""))

# â”€â”€ CELL 3 : Preprocessing & Sampling â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
cells.append(nbf.v4.new_markdown_cell("""## 2. Preprocessing dan Sampling Data
**Metode Sampling:** Stratified Random Sampling proporsional per bulan
- Total 24 bulan periode data (Sep 2018 â€“ Sep 2020)
- Ambil 500.000 transaksi secara proporsional dari setiap bulan
- Tujuan: memastikan sampel representatif terhadap seluruh periode waktu
"""))
cells.append(nbf.v4.new_code_cell("""\
# === Normalisasi article_id â€” zero-padding 10 digit ===
articles['article_id']          = articles['article_id'].astype(str).str.zfill(10)
transactions_full['article_id'] = transactions_full['article_id'].astype(str).str.zfill(10)
transactions_full['customer_id']= transactions_full['customer_id'].astype(str)

# Verifikasi format
print(f"Format article_id articles     : {articles['article_id'].iloc[0]}")
print(f"Format article_id transactions : {transactions_full['article_id'].iloc[0]}")

# === Stratified Random Sampling per bulan ===
TARGET_SAMPLE = 500_000
transactions_full['month'] = transactions_full['t_dat'].dt.to_period('M')
monthly_counts = transactions_full['month'].value_counts()
total = len(transactions_full)

# Hitung proporsi tiap bulan
monthly_proportions = monthly_counts / total
monthly_samples = (monthly_proportions * TARGET_SAMPLE).astype(int)

# Sample per bulan
sampled_dfs = []
for month, n in monthly_samples.items():
    month_df = transactions_full[transactions_full['month'] == month]
    n = min(n, len(month_df))
    sampled_dfs.append(month_df.sample(n=n, random_state=42))

transactions = pd.concat(sampled_dfs).reset_index(drop=True)
print(f"\\nâœ… Stratified sampling selesai")
print(f"Total sample : {len(transactions):,} transaksi")
print(f"Periode      : {transactions['t_dat'].min()} s/d {transactions['t_dat'].max()}")
print(f"Jumlah bulan : {transactions['month'].nunique()}")

# === Content Feature Engineering â€” gabungkan 7 fitur teks ===
articles['content_features'] = (
    articles['prod_name'].fillna('')             + ' ' +
    articles['product_type_name'].fillna('')     + ' ' +
    articles['product_group_name'].fillna('')    + ' ' +
    articles['graphical_appearance_name'].fillna('') + ' ' +
    articles['colour_group_name'].fillna('')     + ' ' +
    articles['section_name'].fillna('')          + ' ' +
    articles['garment_group_name'].fillna('')
)

print(f"\\nContoh content_features:")
print(articles['content_features'].iloc[0])

# === Handling Missing Values ===
print(f"\\nMissing values articles:")
print(articles[['prod_name','product_type_name','colour_group_name']].isnull().sum())
print(f"\\nMissing values customers:")
print(customers[['age','club_member_status']].isnull().sum())
"""))

# â”€â”€ CELL 4 : EDA â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
cells.append(nbf.v4.new_markdown_cell("## 3. Exploratory Data Analysis (EDA)"))
cells.append(nbf.v4.new_code_cell("""\
fig, axes = plt.subplots(2, 3, figsize=(18, 10))

# 1. Top 10 kategori produk
articles['product_group_name'].value_counts().head(10).plot(
    kind='barh', ax=axes[0][0], color='steelblue'
)
axes[0][0].set_title('Top 10 Kategori Produk', fontsize=12)
axes[0][0].set_xlabel('Jumlah Artikel')

# 2. Top 10 warna produk
articles['colour_group_name'].value_counts().head(10).plot(
    kind='bar', ax=axes[0][1], color='coral'
)
axes[0][1].set_title('Top 10 Warna Produk', fontsize=12)
axes[0][1].tick_params(axis='x', rotation=45)

# 3. Tren transaksi per bulan â€” stratified sampling
monthly_trend = transactions.groupby('month').size()
monthly_trend.index = monthly_trend.index.astype(str)
monthly_trend.plot(ax=axes[0][2], color='green', marker='o', markersize=4, linewidth=2)
axes[0][2].set_title('Tren Transaksi per Bulan (Sep 2018â€“Sep 2020)', fontsize=12)
axes[0][2].tick_params(axis='x', rotation=45)
axes[0][2].set_xlabel('Bulan')

# 4. Distribusi usia customer
customers['age'].dropna().plot(
    kind='hist', bins=30, ax=axes[1][0], color='mediumpurple', edgecolor='white'
)
axes[1][0].set_title('Distribusi Usia Customer', fontsize=12)
axes[1][0].set_xlabel('Usia')

# 5. Sales channel distribution
transactions['sales_channel_id'].value_counts().plot(
    kind='pie', ax=axes[1][1], autopct='%1.1f%%',
    colors=['#4CAF50','#2196F3'],
    labels=['Online (2)','Toko (1)']
)
axes[1][1].set_title('Distribusi Channel Penjualan', fontsize=12)
axes[1][1].set_ylabel('')

# 6. Top 10 produk terlaris
top_products = transactions['article_id'].value_counts().head(10)
top_names = []
for aid in top_products.index:
    name = articles[articles['article_id']==aid]['prod_name'].values
    top_names.append(name[0][:25] if len(name)>0 else aid)
pd.Series(top_products.values, index=top_names).plot(
    kind='barh', ax=axes[1][2], color='tomato'
)
axes[1][2].set_title('Top 10 Produk Terlaris', fontsize=12)
axes[1][2].invert_yaxis()

plt.suptitle('EDA â€” H&M Fashion Dataset\\nSistem Rekomendasi Strategi Merchandising Industri Tekstil',
             fontsize=14, fontweight='bold')
plt.tight_layout()
plt.savefig('eda_fashion.png', dpi=150, bbox_inches='tight')
plt.show()
print("âœ… EDA saved: eda_fashion.png")
"""))

# â”€â”€ CELL 5 : User-Item Matrix â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
cells.append(nbf.v4.new_markdown_cell("""## 4. Pembangunan User-Item Interaction Matrix
- User = `customer_id`
- Item = `article_id`
- Rating = frekuensi pembelian (implicit rating, clip skala 1â€“5)
- Filter: minimum 3 interaksi per customer dan per produk
"""))
cells.append(nbf.v4.new_code_cell("""\
# Hitung implicit rating dari frekuensi pembelian
ratings = transactions.groupby(
    ['customer_id', 'article_id']
).size().reset_index(name='rating')
ratings['rating'] = ratings['rating'].clip(upper=5)

print(f"Total ratings sebelum filter : {len(ratings):,}")
print(f"Distribusi rating:")
print(ratings['rating'].value_counts().sort_index())

# Filter minimum 3 interaksi
active_customers = ratings['customer_id'].value_counts()
active_customers = active_customers[active_customers >= 3].index
active_articles  = ratings['article_id'].value_counts()
active_articles  = active_articles[active_articles >= 3].index

ratings_filtered = ratings[
    ratings['customer_id'].isin(active_customers) &
    ratings['article_id'].isin(active_articles)
].reset_index(drop=True)

print(f"\\nTotal ratings setelah filter : {len(ratings_filtered):,}")
print(f"Unique customers             : {ratings_filtered['customer_id'].nunique():,}")
print(f"Unique articles              : {ratings_filtered['article_id'].nunique():,}")

# Sparsity matrix
sparsity = 1 - len(ratings_filtered) / (
    ratings_filtered['customer_id'].nunique() *
    ratings_filtered['article_id'].nunique()
)
print(f"Sparsity matrix              : {sparsity:.4%}")

# Sample untuk training SVD â€” max 100K
if len(ratings_filtered) > 100000:
    ratings_svd = ratings_filtered.sample(100000, random_state=42)
    print(f"\\nSample untuk SVD training    : 100.000 ratings")
else:
    ratings_svd = ratings_filtered.copy()
"""))

# â”€â”€ CELL 6 : CBF â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
cells.append(nbf.v4.new_markdown_cell("""## 5. Content Feature Engineering & Content-Based Filtering Modeling
**Fitur yang digunakan (7 fitur teks):**
- `prod_name`, `product_type_name`, `product_group_name`
- `graphical_appearance_name`, `colour_group_name`
- `section_name`, `garment_group_name`

**Metode:** TF-IDF Vectorizer â†’ Cosine Similarity
"""))
cells.append(nbf.v4.new_code_cell("""\
print("Building Content-Based Filtering...")

# TF-IDF dari 7 fitur teks gabungan
tfidf        = TfidfVectorizer(max_features=5000, stop_words='english')
tfidf_matrix = tfidf.fit_transform(articles['content_features'])

print(f"TF-IDF matrix shape: {tfidf_matrix.shape}")
print(f"Vocabulary size    : {len(tfidf.vocabulary_):,}")

# Sample 10K artikel untuk efisiensi cosine similarity
sample_articles = articles.sample(10000, random_state=42).reset_index(drop=True)
tfidf_sample    = tfidf.transform(sample_articles['content_features'])
cos_sim         = cosine_similarity(tfidf_sample, tfidf_sample)

print(f"Cosine similarity matrix shape: {cos_sim.shape}")

# Mapping article_id â†’ index
article_idx = pd.Series(
    sample_articles.index,
    index=sample_articles['article_id']
)

def rekomendasi_cbf(article_id, top_n=5):
    article_id = str(article_id).zfill(10)
    if article_id not in article_idx.index:
        return pd.DataFrame()
    idx    = article_idx[article_id]
    scores = sorted(enumerate(cos_sim[idx]), key=lambda x: x[1], reverse=True)
    scores = [s for s in scores if s[0] != idx][:top_n]
    hasil  = []
    for i, score in scores:
        row = sample_articles.iloc[i]
        hasil.append({
            'Article ID'  : row['article_id'],
            'Product Name': row['prod_name'],
            'Category'    : row['product_group_name'],
            'Colour'      : row['colour_group_name'],
            'CBF Score'   : round(float(score), 4)
        })
    return pd.DataFrame(hasil)

# Test CBF
sample_id = sample_articles['article_id'].iloc[0]
sample_name = sample_articles['prod_name'].iloc[0]
print(f"\\nTest CBF untuk: {sample_id} â€” {sample_name}")
print(rekomendasi_cbf(sample_id))
"""))

# â”€â”€ CELL 7 : CF â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
cells.append(nbf.v4.new_markdown_cell("""## 6. Collaborative Filtering Modeling
**Metode:** SVD (Singular Value Decomposition / Matrix Factorization)
- Library: Surprise
- n_factors=50, n_epochs=20
- Evaluasi: 3-fold cross validation (RMSE, MAE)
"""))
cells.append(nbf.v4.new_code_cell("""\
print("Building Collaborative Filtering (SVD)...")

reader  = Reader(rating_scale=(1, 5))
data    = Dataset.load_from_df(
    ratings_svd[['customer_id', 'article_id', 'rating']], reader
)

svd     = SVD(n_factors=50, n_epochs=20, random_state=42)
results = cross_validate(svd, data, measures=['RMSE','MAE'], cv=3, verbose=False)

print(f"SVD Cross-Validation (3-fold):")
print(f"  RMSE : {results['test_rmse'].mean():.4f} Â± {results['test_rmse'].std():.4f}")
print(f"  MAE  : {results['test_mae'].mean():.4f}  Â± {results['test_mae'].std():.4f}")

# Train full model
trainset = data.build_full_trainset()
svd.fit(trainset)
valid_customers = [trainset.to_raw_uid(i) for i in range(trainset.n_users)]
print(f"\\nâœ… SVD model trained â€” {len(valid_customers):,} valid customers")

def rekomendasi_cf(customer_id, top_n=5):
    customer_id = str(customer_id)
    if customer_id not in valid_customers:
        return pd.DataFrame()
    sudah_beli    = ratings_filtered[
        ratings_filtered['customer_id'] == customer_id
    ]['article_id'].tolist()
    semua_artikel = ratings_filtered['article_id'].unique()
    belum_beli    = [a for a in semua_artikel if a not in sudah_beli][:1000]
    prediksi = [(a, svd.predict(customer_id, a).est) for a in belum_beli]
    prediksi.sort(key=lambda x: x[1], reverse=True)
    hasil = []
    for article_id, score in prediksi[:top_n]:
        info = articles[articles['article_id'] == str(article_id).zfill(10)]
        if len(info) > 0:
            row = info.iloc[0]
            hasil.append({
                'Article ID'  : str(article_id).zfill(10),
                'Product Name': row['prod_name'],
                'Category'    : row['product_group_name'],
                'Colour'      : row['colour_group_name'],
                'CF Score'    : round(float(score), 4)
            })
    return pd.DataFrame(hasil)

sample_customer = valid_customers[0]
print(f"\\nTest CF untuk customer: {sample_customer[:20]}...")
print(rekomendasi_cf(sample_customer))
"""))

# â”€â”€ CELL 8 : Hybrid â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
cells.append(nbf.v4.new_markdown_cell("""## 7. Penggabungan Hybrid Recommendation Score
**Formula:** `Hybrid Score = 0.6 Ã— CF Score (norm) + 0.4 Ã— CBF Score`
- CF Score dinormalisasi ke skala 0â€“1
- CBF Score sudah dalam skala 0â€“1 (cosine similarity)
"""))
cells.append(nbf.v4.new_code_cell("""\
def rekomendasi_hybrid(customer_id, top_n=5, w_cf=0.6, w_cbf=0.4):
    customer_id = str(customer_id)
    if customer_id not in valid_customers:
        return pd.DataFrame()

    sudah_beli    = ratings_filtered[
        ratings_filtered['customer_id'] == customer_id
    ]['article_id'].tolist()
    semua_artikel = ratings_filtered['article_id'].unique()
    belum_beli    = [a for a in semua_artikel if a not in sudah_beli][:500]

    if not belum_beli:
        return pd.DataFrame()

    # CF scores â€” normalisasi ke 0-1
    cf_raw   = {a: svd.predict(customer_id, a).est for a in belum_beli}
    cf_min, cf_max = min(cf_raw.values()), max(cf_raw.values())
    cf_range = cf_max - cf_min if cf_max != cf_min else 1
    cf_norm  = {k: (v - cf_min) / cf_range for k, v in cf_raw.items()}

    # CBF scores dari artikel referensi
    cbf_scores = {}
    if sudah_beli:
        ref        = str(sudah_beli[0]).zfill(10)
        cbf_result = rekomendasi_cbf(ref, top_n=200)
        if isinstance(cbf_result, pd.DataFrame) and len(cbf_result) > 0:
            cbf_scores = dict(zip(cbf_result['Article ID'], cbf_result['CBF Score']))

    # Hybrid score
    hasil = []
    for article_id in belum_beli:
        art_pad = str(article_id).zfill(10)
        cf      = cf_norm.get(article_id, 0)
        cbf     = cbf_scores.get(art_pad, 0)
        hybrid  = w_cf * cf + w_cbf * cbf
        info    = articles[articles['article_id'] == art_pad]
        if len(info) > 0:
            row = info.iloc[0]
            hasil.append({
                'Article ID'  : art_pad,
                'Product Name': row['prod_name'],
                'Category'    : row['product_group_name'],
                'Colour'      : row['colour_group_name'],
                'CF Score'    : round(cf, 4),
                'CBF Score'   : round(cbf, 4),
                'Hybrid Score': round(hybrid, 4)
            })

    if not hasil:
        return pd.DataFrame()

    hasil_df = pd.DataFrame(hasil)
    hasil_df = hasil_df.nlargest(top_n, 'Hybrid Score').reset_index(drop=True)
    hasil_df.index += 1
    return hasil_df

print("=== TEST REKOMENDASI HYBRID ===")
hasil = rekomendasi_hybrid(sample_customer, top_n=5)
print(f"Customer: {sample_customer[:30]}...")
print(hasil.to_string() if len(hasil) > 0 else "Empty DataFrame")
"""))

# â”€â”€ CELL 9 : Ranking & Visualisasi â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
cells.append(nbf.v4.new_markdown_cell("## 8. Ranking Top-N Recommendation & Visualisasi"))
cells.append(nbf.v4.new_code_cell("""\
def visualisasi_hasil(hasil_df, customer_id):
    if len(hasil_df) == 0:
        print("Tidak ada hasil rekomendasi.")
        return

    fig, axes = plt.subplots(1, 2, figsize=(16, 6))
    colors = ['#1f77b4','#ff7f0e','#2ca02c','#d62728','#9467bd']

    # Bar chart hybrid score
    axes[0].barh(
        hasil_df['Product Name'].str[:30],
        hasil_df['Hybrid Score'],
        color=colors[:len(hasil_df)]
    )
    axes[0].set_xlabel('Hybrid Score', fontsize=11)
    axes[0].set_title(f'Top-5 Rekomendasi Produk Fashion\\nCustomer: {customer_id[:20]}...', fontsize=11)
    axes[0].invert_yaxis()
    for i, v in enumerate(hasil_df['Hybrid Score']):
        axes[0].text(v + 0.003, i, f'{v:.4f}', va='center', fontsize=9)

    # Stacked bar CF vs CBF contribution
    x     = range(len(hasil_df))
    names = [n[:20] for n in hasil_df['Product Name']]
    axes[1].bar(x, hasil_df['CF Score'],  label='CF Score (60%)',  color='steelblue', alpha=0.85)
    axes[1].bar(x, hasil_df['CBF Score'], label='CBF Score (40%)',
                bottom=hasil_df['CF Score'], color='coral', alpha=0.85)
    axes[1].set_xticks(x)
    axes[1].set_xticklabels(names, rotation=45, ha='right', fontsize=9)
    axes[1].set_title('Kontribusi CF vs CBF Score per Produk', fontsize=11)
    axes[1].set_ylabel('Score')
    axes[1].legend()

    plt.suptitle(
        'Dashboard Rekomendasi Produk Fashion\\nuntuk Keputusan Merchandising Industri Tekstil H&M',
        fontsize=13, fontweight='bold'
    )
    plt.tight_layout()
    plt.savefig('hasil_rekomendasi_fashion.png', dpi=150, bbox_inches='tight')
    plt.show()
    print("âœ… Saved: hasil_rekomendasi_fashion.png")

if len(hasil) > 0:
    visualisasi_hasil(hasil, sample_customer)
"""))

# â”€â”€ CELL 10 : Evaluasi â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
cells.append(nbf.v4.new_markdown_cell("""## 9. Evaluasi Sistem Rekomendasi
**Metrik:** Precision@K, Recall@K, F1-Score
- Ground truth = produk dengan rating tertinggi dalam histori customer
- K = 5 (Top-5 rekomendasi)
"""))
cells.append(nbf.v4.new_code_cell("""\
def evaluasi_sistem(n_test=100, top_n=5):
    precision_list, recall_list = [], []
    test_customers = [
        c for c in valid_customers[:n_test]
        if len(ratings_filtered[ratings_filtered['customer_id']==c]) >= 2
    ]

    print(f"Evaluasi {len(test_customers)} customer...")
    for cust in test_customers:
        ground_truth = ratings_filtered[
            ratings_filtered['customer_id'] == cust
        ].nlargest(1, 'rating')['article_id'].values[0]

        hasil = rekomendasi_hybrid(cust, top_n=top_n)
        if isinstance(hasil, pd.DataFrame) and len(hasil) > 0:
            hit = 1 if ground_truth in hasil['Article ID'].tolist() else 0
            precision_list.append(hit / top_n)
            recall_list.append(float(hit))

    if precision_list:
        precision = np.mean(precision_list)
        recall    = np.mean(recall_list)
        f1        = 2 * precision * recall / (precision + recall + 1e-9)

        print(f"\\n{'='*40}")
        print(f"HASIL EVALUASI SISTEM REKOMENDASI")
        print(f"{'='*40}")
        print(f"Precision@{top_n} : {precision:.4f} ({precision*100:.2f}%)")
        print(f"Recall@{top_n}    : {recall:.4f}  ({recall*100:.2f}%)")
        print(f"F1-Score@{top_n}  : {f1:.4f}  ({f1*100:.2f}%)")
        print(f"{'='*40}")
        print(f"Total test customer: {len(precision_list)}")
        return precision, recall, f1
    else:
        print("Tidak ada data evaluasi.")
        return 0, 0, 0

precision, recall, f1 = evaluasi_sistem(n_test=100, top_n=5)
"""))

# â”€â”€ CELL 11 : Analisis & Simpan Model â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
cells.append(nbf.v4.new_markdown_cell("## 10. Analisis Keseluruhan & Simpan Model"))
cells.append(nbf.v4.new_code_cell("""\
# === Analisis perbandingan CF vs CBF vs Hybrid ===
print("Analisis perbandingan metode...")

test_customers_analysis = [
    c for c in valid_customers[:50]
    if len(ratings_filtered[ratings_filtered['customer_id']==c]) >= 2
]

cf_prec, cbf_prec, hybrid_prec = [], [], []

for cust in test_customers_analysis:
    ground_truth = ratings_filtered[
        ratings_filtered['customer_id'] == cust
    ].nlargest(1, 'rating')['article_id'].values[0]

    # CF only
    cf_result = rekomendasi_cf(cust, top_n=5)
    if len(cf_result) > 0:
        hit = 1 if ground_truth in cf_result['Article ID'].tolist() else 0
        cf_prec.append(hit / 5)

    # CBF only â€” dari artikel yang pernah dibeli
    sudah_beli = ratings_filtered[
        ratings_filtered['customer_id'] == cust
    ]['article_id'].tolist()
    if sudah_beli:
        ref = str(sudah_beli[0]).zfill(10)
        cbf_result = rekomendasi_cbf(ref, top_n=5)
        if len(cbf_result) > 0:
            hit = 1 if ground_truth in cbf_result['Article ID'].tolist() else 0
            cbf_prec.append(hit / 5)

    # Hybrid
    hybrid_result = rekomendasi_hybrid(cust, top_n=5)
    if len(hybrid_result) > 0:
        hit = 1 if ground_truth in hybrid_result['Article ID'].tolist() else 0
        hybrid_prec.append(hit / 5)

# Visualisasi perbandingan
methods = ['Collaborative\\nFiltering (SVD)', 'Content-Based\\nFiltering', 'Hybrid\\nRecommendation']
scores  = [
    np.mean(cf_prec)     if cf_prec     else 0,
    np.mean(cbf_prec)    if cbf_prec    else 0,
    np.mean(hybrid_prec) if hybrid_prec else 0,
]

fig, ax = plt.subplots(figsize=(8, 5))
bars = ax.bar(methods, scores, color=['steelblue','coral','#2ca02c'], width=0.5, edgecolor='white')
ax.set_ylabel('Precision@5', fontsize=12)
ax.set_title('Perbandingan Performa: CF vs CBF vs Hybrid\\n(Precision@5)', fontsize=12)
ax.set_ylim(0, max(scores) * 1.3 if max(scores) > 0 else 0.1)
for bar, score in zip(bars, scores):
    ax.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 0.002,
            f'{score:.4f}', ha='center', va='bottom', fontsize=11, fontweight='bold')
plt.tight_layout()
plt.savefig('perbandingan_metode.png', dpi=150, bbox_inches='tight')
plt.show()
print("âœ… Saved: perbandingan_metode.png")

print(f"\\nCF Precision@5    : {scores[0]:.4f}")
print(f"CBF Precision@5   : {scores[1]:.4f}")
print(f"Hybrid Precision@5: {scores[2]:.4f}")

# === Simpan model & data untuk dashboard ===
print("\\nMenyimpan model dan data...")
joblib.dump(svd,          'model_svd.pkl')
joblib.dump(tfidf,        'model_tfidf.pkl')
joblib.dump(cos_sim,      'model_cossim.pkl')
joblib.dump(article_idx,  'model_articleidx.pkl')

# Simpan data yang dibutuhkan dashboard
articles.to_parquet('data_articles.parquet',          index=False)
sample_articles.to_parquet('data_sample_articles.parquet', index=False)
ratings_filtered.to_parquet('data_ratings.parquet',   index=False)

# Simpan valid_customers list
import json
with open('valid_customers.json', 'w') as f:
    json.dump(valid_customers[:1000], f)

print("âœ… Model tersimpan:")
print("  - model_svd.pkl")
print("  - model_tfidf.pkl")
print("  - model_cossim.pkl")
print("  - model_articleidx.pkl")
print("  - data_articles.parquet")
print("  - data_sample_articles.parquet")
print("  - data_ratings.parquet")
print("  - valid_customers.json")
print("\\nðŸŽ‰ Notebook selesai! Jalankan dashboard.py dengan: streamlit run dashboard.py")
"""))

nb.cells = cells

with open('recsys_fashion.ipynb', 'w', encoding='utf-8') as f:
    nbf.write(nb, f)

print("Notebook berhasil dibuat!")

