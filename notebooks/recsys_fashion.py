# ============================================================
# FILE: recsys_fashion.py
# Sistem Rekomendasi Produk Fashion untuk Mendukung
# Keputusan Merchandising di Industri Tekstil
# Studi Kasus: H&M
# ============================================================

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from surprise import SVD, Dataset, Reader
from surprise.model_selection import cross_validate
import warnings
warnings.filterwarnings('ignore')

# ============================================================
# STEP 1 — LOAD DATASET
# ============================================================
print("Loading dataset...")

articles     = pd.read_csv('articles.csv')
customers    = pd.read_csv('customers.csv')

# Load merata dari seluruh periode — skip rows acak supaya dapat semua bulan
transactions = pd.read_csv('transactions_train.csv',
                           dtype={'article_id': str, 'customer_id': str})
# Ambil sample 500K yang merata dari seluruh periode
transactions = transactions.sample(n=500000, random_state=42)

print(f"Articles    : {articles.shape}")
print(f"Customers   : {customers.shape}")
print(f"Transactions: {transactions.shape}")

# ============================================================
# STEP 2 — PREPROCESSING
# ============================================================
print("\nPreprocessing...")

# Fix article_id — zero-padding 10 digit supaya format sama
articles['article_id']     = articles['article_id'].astype(str).str.zfill(10)
transactions['article_id'] = transactions['article_id'].astype(str).str.zfill(10)
transactions['customer_id'] = transactions['customer_id'].astype(str)
transactions['t_dat']       = pd.to_datetime(transactions['t_dat'])

# Verifikasi format
print(f"Sample article_id articles    : {articles['article_id'].iloc[0]}")
print(f"Sample article_id transactions: {transactions['article_id'].iloc[0]}")

# Fitur teks gabungan untuk Content-Based
articles['content_features'] = (
    articles['prod_name'].fillna('') + ' ' +
    articles['product_type_name'].fillna('') + ' ' +
    articles['product_group_name'].fillna('') + ' ' +
    articles['graphical_appearance_name'].fillna('') + ' ' +
    articles['colour_group_name'].fillna('') + ' ' +
    articles['section_name'].fillna('') + ' ' +
    articles['garment_group_name'].fillna('')
)

# Rating implisit dari frekuensi beli
ratings = transactions.groupby(
    ['customer_id', 'article_id']
).size().reset_index(name='rating')
ratings['rating'] = ratings['rating'].clip(upper=5)

print(f"\nUnique customers: {ratings['customer_id'].nunique()}")
print(f"Unique articles : {ratings['article_id'].nunique()}")
print(f"Total ratings   : {len(ratings)}")

# ============================================================
# STEP 3 — EDA
# ============================================================
print("\nGenerating EDA plots...")

fig, axes = plt.subplots(2, 2, figsize=(14, 10))

# Top 10 kategori produk
articles['product_group_name'].value_counts().head(10).plot(
    kind='barh', ax=axes[0][0], color='steelblue'
)
axes[0][0].set_title('Top 10 Kategori Produk')
axes[0][0].set_xlabel('Jumlah Artikel')

# Top 10 warna produk
articles['colour_group_name'].value_counts().head(10).plot(
    kind='bar', ax=axes[0][1], color='coral'
)
axes[0][1].set_title('Top 10 Warna Produk')
axes[0][1].tick_params(axis='x', rotation=45)

# Transaksi per bulan — sekarang sudah merata
transactions['month'] = transactions['t_dat'].dt.to_period('M')
monthly = transactions.groupby('month').size()
monthly.index = monthly.index.astype(str)
monthly.plot(ax=axes[1][0], color='green', marker='o', markersize=4)
axes[1][0].set_title('Jumlah Transaksi per Bulan (Sep 2018 – Sep 2020)')
axes[1][0].tick_params(axis='x', rotation=45)
axes[1][0].set_xlabel('Bulan')

# Distribusi rating
ratings['rating'].value_counts().sort_index().plot(
    kind='bar', ax=axes[1][1], color='purple'
)
axes[1][1].set_title('Distribusi Rating Implisit (Frekuensi Beli)')
axes[1][1].set_xlabel('Rating')

plt.suptitle('EDA — H&M Fashion Dataset (Industri Retail Tekstil)', fontsize=14)
plt.tight_layout()
plt.savefig('eda_fashion.png', dpi=150, bbox_inches='tight')
plt.show()
print("EDA saved: eda_fashion.png")

# ============================================================
# STEP 4 — CONTENT-BASED FILTERING
# ============================================================
print("\nBuilding Content-Based Filtering...")

tfidf        = TfidfVectorizer(max_features=5000, stop_words='english')
tfidf_matrix = tfidf.fit_transform(articles['content_features'])

# Sample 10K artikel untuk efisiensi
sample_articles = articles.sample(10000, random_state=42).reset_index(drop=True)
tfidf_sample    = tfidf.transform(sample_articles['content_features'])
cos_sim         = cosine_similarity(tfidf_sample, tfidf_sample)

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
            'CBF Score'   : round(score, 4)
        })
    return pd.DataFrame(hasil)

# Test CBF
sample_id = sample_articles['article_id'].iloc[0]
print(f"\nCBF untuk artikel: {sample_id}")
print(rekomendasi_cbf(sample_id))

# ============================================================
# STEP 5 — COLLABORATIVE FILTERING (SVD)
# ============================================================
print("\nBuilding Collaborative Filtering (SVD)...")

# Filter customer dan artikel yang cukup aktif
active_customers = ratings['customer_id'].value_counts()
active_customers = active_customers[active_customers >= 3].index
active_articles  = ratings['article_id'].value_counts()
active_articles  = active_articles[active_articles >= 3].index

ratings_filtered = ratings[
    ratings['customer_id'].isin(active_customers) &
    ratings['article_id'].isin(active_articles)
]

if len(ratings_filtered) > 100000:
    ratings_filtered = ratings_filtered.sample(100000, random_state=42)

print(f"Filtered ratings: {len(ratings_filtered)}")

reader  = Reader(rating_scale=(1, 5))
data    = Dataset.load_from_df(
    ratings_filtered[['customer_id', 'article_id', 'rating']], reader
)
svd     = SVD(n_factors=50, n_epochs=20, random_state=42)
results = cross_validate(svd, data, measures=['RMSE', 'MAE'], cv=3, verbose=False)
print(f"SVD RMSE: {results['test_rmse'].mean():.4f}")
print(f"SVD MAE : {results['test_mae'].mean():.4f}")

trainset = data.build_full_trainset()
svd.fit(trainset)

# Ambil customer valid dari trainset
valid_customers = [trainset.to_raw_uid(i) for i in range(trainset.n_users)]

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
                'Article ID'  : article_id,
                'Product Name': row['prod_name'],
                'Category'    : row['product_group_name'],
                'Colour'      : row['colour_group_name'],
                'CF Score'    : round(score, 4)
            })
    return pd.DataFrame(hasil)

sample_customer = valid_customers[0]
print(f"\nCF untuk customer: {sample_customer[:20]}...")
print(rekomendasi_cf(sample_customer))

# ============================================================
# STEP 6 — HYBRID RECOMMENDATION
# ============================================================
def rekomendasi_hybrid(customer_id, top_n=5, w_cf=0.6, w_cbf=0.4):
    customer_id = str(customer_id)
    if customer_id not in valid_customers:
        return pd.DataFrame()

    sudah_beli    = ratings_filtered[
        ratings_filtered['customer_id'] == customer_id
    ]['article_id'].tolist()
    semua_artikel = ratings_filtered['article_id'].unique()
    belum_beli    = [a for a in semua_artikel if a not in sudah_beli][:500]

    # CF scores — normalisasi ke 0-1
    cf_raw   = {a: svd.predict(customer_id, a).est for a in belum_beli}
    cf_min   = min(cf_raw.values())
    cf_max   = max(cf_raw.values())
    cf_range = cf_max - cf_min if cf_max != cf_min else 1
    cf_norm  = {k: (v - cf_min) / cf_range for k, v in cf_raw.items()}

    # CBF scores dari artikel referensi yang pernah dibeli
    cbf_scores = {}
    if sudah_beli:
        ref = str(sudah_beli[0]).zfill(10)
        cbf_result = rekomendasi_cbf(ref, top_n=200)
        if isinstance(cbf_result, pd.DataFrame) and len(cbf_result) > 0:
            cbf_scores = dict(zip(
                cbf_result['Article ID'],
                cbf_result['CBF Score']
            ))

    # Hitung hybrid score
    hasil = []
    for article_id in belum_beli:
        art_pad = str(article_id).zfill(10)
        cf      = cf_norm.get(article_id, 0)
        cbf     = cbf_scores.get(art_pad, 0)
        hybrid  = w_cf * cf + w_cbf * cbf

        info = articles[articles['article_id'] == art_pad]
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

print(f"\n=== REKOMENDASI HYBRID ===")
hasil = rekomendasi_hybrid(sample_customer, top_n=5)
print(hasil.to_string(index=False) if len(hasil) > 0 else "Empty")

# ============================================================
# STEP 7 — VISUALISASI HASIL
# ============================================================
def visualisasi_hasil(hasil_df, customer_id):
    if len(hasil_df) == 0:
        print("Tidak ada hasil.")
        return

    fig, axes = plt.subplots(1, 2, figsize=(14, 5))
    colors = ['#1f77b4','#ff7f0e','#2ca02c','#d62728','#9467bd']

    # Bar chart hybrid score
    axes[0].barh(
        hasil_df['Product Name'].str[:30],
        hasil_df['Hybrid Score'],
        color=colors[:len(hasil_df)]
    )
    axes[0].set_xlabel('Hybrid Score')
    axes[0].set_title(f'Top-5 Rekomendasi Merchandising\nCustomer: {customer_id[:15]}...')
    axes[0].invert_yaxis()
    for i, v in enumerate(hasil_df['Hybrid Score']):
        axes[0].text(v + 0.005, i, f'{v:.4f}', va='center', fontsize=9)

    # Stacked bar CF vs CBF
    x     = range(len(hasil_df))
    names = [n[:20] for n in hasil_df['Product Name']]
    axes[1].bar(x, hasil_df['CF Score'],  label='CF Score (60%)',  color='steelblue')
    axes[1].bar(x, hasil_df['CBF Score'], label='CBF Score (40%)',
                bottom=hasil_df['CF Score'], color='coral')
    axes[1].set_xticks(x)
    axes[1].set_xticklabels(names, rotation=45, ha='right', fontsize=9)
    axes[1].set_title('Kontribusi CF vs CBF Score')
    axes[1].legend()

    plt.suptitle(
        'Dashboard Rekomendasi Produk Fashion\nuntuk Keputusan Merchandising Industri Tekstil H&M',
        fontsize=12
    )
    plt.tight_layout()
    plt.savefig('hasil_rekomendasi_fashion.png', dpi=150, bbox_inches='tight')
    plt.show()
    print("Saved: hasil_rekomendasi_fashion.png")

if len(hasil) > 0:
    visualisasi_hasil(hasil, sample_customer)

# ============================================================
# STEP 8 — EVALUASI
# ============================================================
print("\n=== EVALUASI SISTEM ===")

def evaluasi(n_test=100, top_n=5):
    precision_list = []
    test_customers = [c for c in valid_customers[:n_test]
                      if len(ratings_filtered[ratings_filtered['customer_id']==c]) >= 2]

    for cust in test_customers:
        ground_truth = ratings_filtered[
            ratings_filtered['customer_id'] == cust
        ].nlargest(1, 'rating')['article_id'].values[0]

        hasil = rekomendasi_hybrid(cust, top_n=top_n)
        if isinstance(hasil, pd.DataFrame) and len(hasil) > 0:
            hit = 1 if ground_truth in hasil['Article ID'].tolist() else 0
            precision_list.append(hit / top_n)

    if precision_list:
        precision = np.mean(precision_list)
        recall    = np.mean([p * top_n for p in precision_list])
        f1        = 2 * precision * recall / (precision + recall + 1e-9)
        print(f"Precision@{top_n} : {precision:.4f}")
        print(f"Recall@{top_n}    : {recall:.4f}")
        print(f"F1-Score         : {f1:.4f}")
    else:
        print("Tidak ada data evaluasi.")

evaluasi(n_test=100, top_n=5)

print("\n✅ Selesai!")
print("Output: eda_fashion.png, hasil_rekomendasi_fashion.png")