# ============================================================
# FILE: dashboard.py
# Dashboard Sistem Rekomendasi Produk Fashion H&M
# Jalankan: streamlit run dashboard.py
# ============================================================

import streamlit as st
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
import plotly.express as px
import plotly.graph_objects as go
from plotly.subplots import make_subplots
import joblib
import json
import warnings
warnings.filterwarnings('ignore')
from sklearn.metrics.pairwise import cosine_similarity

# ============================================================
# KONFIGURASI HALAMAN
# ============================================================
st.set_page_config(
    page_title="H&M Fashion Recommender — Merchandising Dashboard",
    page_icon="👗",
    layout="wide",
    initial_sidebar_state="expanded"
)

# CSS Custom
st.markdown("""
<style>
    .main-header {
        background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
        padding: 2rem;
        border-radius: 12px;
        margin-bottom: 1.5rem;
        text-align: center;
    }
    .main-header h1 {
        color: #e94560;
        font-size: 1.8rem;
        font-weight: 700;
        margin: 0;
    }
    .main-header p {
        color: #a8b2d8;
        margin: 0.5rem 0 0 0;
        font-size: 0.95rem;
    }
    .metric-card {
        background: #1e1e2e;
        border: 1px solid #2d2d4e;
        border-radius: 10px;
        padding: 1rem;
        text-align: center;
    }
    .rec-card {
        background: linear-gradient(135deg, #1e1e2e, #16213e);
        border: 1px solid #e94560;
        border-radius: 10px;
        padding: 1rem;
        margin-bottom: 0.75rem;
    }
    .score-badge {
        background: #e94560;
        color: white;
        padding: 0.25rem 0.75rem;
        border-radius: 20px;
        font-weight: 700;
        font-size: 0.9rem;
    }
    .sdg-badge {
        background: linear-gradient(135deg, #f97316, #ef4444);
        color: white;
        padding: 0.3rem 1rem;
        border-radius: 20px;
        font-size: 0.85rem;
        font-weight: 600;
        display: inline-block;
        margin-bottom: 0.5rem;
    }
    div[data-testid="stSidebar"] {
        background: #0f0f1a;
    }
</style>
""", unsafe_allow_html=True)

# ============================================================
# LOAD MODEL & DATA
# ============================================================
@st.cache_resource
def load_models():
    svd         = joblib.load('model_svd.pkl')
    tfidf       = joblib.load('model_tfidf.pkl')
    cos_sim     = joblib.load('model_cossim.pkl')
    article_idx = joblib.load('model_articleidx.pkl')
    return svd, tfidf, cos_sim, article_idx

@st.cache_data
def load_data():
    articles        = pd.read_parquet('data_articles.parquet')
    sample_articles = pd.read_parquet('data_sample_articles.parquet')
    ratings         = pd.read_parquet('data_ratings.parquet')
    with open('valid_customers.json') as f:
        valid_customers = json.load(f)
    return articles, sample_articles, ratings, valid_customers

# Load
try:
    svd, tfidf, cos_sim, article_idx = load_models()
    articles, sample_articles, ratings, valid_customers = load_data()
    MODEL_LOADED = True
except Exception as e:
    MODEL_LOADED = False
    st.error(f"❌ Model belum tersedia. Jalankan notebook terlebih dahulu.\nError: {e}")

# ============================================================
# FUNGSI REKOMENDASI
# ============================================================
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

def rekomendasi_hybrid(customer_id, top_n=5, w_cf=0.6, w_cbf=0.4):
    customer_id = str(customer_id)
    if customer_id not in valid_customers:
        return pd.DataFrame()

    sudah_beli    = ratings[ratings['customer_id'] == customer_id]['article_id'].tolist()
    semua_artikel = ratings['article_id'].unique()
    belum_beli    = [a for a in semua_artikel if a not in sudah_beli][:500]

    if not belum_beli:
        return pd.DataFrame()

    cf_raw   = {a: svd.predict(customer_id, a).est for a in belum_beli}
    cf_min, cf_max = min(cf_raw.values()), max(cf_raw.values())
    cf_range = cf_max - cf_min if cf_max != cf_min else 1
    cf_norm  = {k: (v - cf_min) / cf_range for k, v in cf_raw.items()}

    cbf_scores = {}
    if sudah_beli:
        ref        = str(sudah_beli[0]).zfill(10)
        cbf_result = rekomendasi_cbf(ref, top_n=200)
        if isinstance(cbf_result, pd.DataFrame) and len(cbf_result) > 0:
            cbf_scores = dict(zip(cbf_result['Article ID'], cbf_result['CBF Score']))

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

# ============================================================
# HEADER
# ============================================================
st.markdown("""
<div class="main-header">
    <h1>👗 H&M Fashion Recommendation Dashboard</h1>
    <p>Sistem Rekomendasi Produk Fashion untuk Mendukung Strategi Merchandising — Industri Tekstil H&M</p>
    <div class="sdg-badge">🌱 SDGs 9 — Industri, Inovasi, dan Infrastruktur</div>
</div>
""", unsafe_allow_html=True)

# ============================================================
# SIDEBAR
# ============================================================
with st.sidebar:
    st.markdown("### ⚙️ Pengaturan Rekomendasi")
    st.markdown("---")

    # Pilih customer
    st.markdown("**Input Customer ID**")
    input_mode = st.radio("Mode input:", ["Pilih dari daftar", "Ketik manual"])

    if input_mode == "Pilih dari daftar":
        selected_customer = st.selectbox(
            "Customer ID:",
            valid_customers[:100],
            format_func=lambda x: x[:30] + "..."
        )
    else:
        selected_customer = st.text_input(
            "Masukkan Customer ID:",
            value=valid_customers[0] if valid_customers else ""
        )

    st.markdown("---")
    st.markdown("**Parameter Hybrid**")
    w_cf  = st.slider("Bobot CF (SVD):", 0.0, 1.0, 0.6, 0.1)
    w_cbf = round(1 - w_cf, 1)
    st.info(f"Bobot CBF otomatis: **{w_cbf}**")

    top_n = st.slider("Top-N Rekomendasi:", 3, 10, 5)

    st.markdown("---")
    run_button = st.button("🚀 Jalankan Rekomendasi", use_container_width=True, type="primary")

    st.markdown("---")
    st.markdown("**ℹ️ Info Model**")
    st.markdown(f"- Model: SVD (n_factors=50)")
    st.markdown(f"- CBF: TF-IDF + Cosine Similarity")
    st.markdown(f"- Formula: `{w_cf}×CF + {w_cbf}×CBF`")
    st.markdown(f"- Valid customers: {len(valid_customers):,}")

# ============================================================
# TABS
# ============================================================
if MODEL_LOADED:
    tab1, tab2, tab3, tab4 = st.tabs([
        "🎯 Rekomendasi",
        "📊 EDA & Analisis",
        "📈 Evaluasi Model",
        "ℹ️ Tentang Sistem"
    ])

    # ── TAB 1: REKOMENDASI ──────────────────────────────────
    with tab1:
        st.markdown("### 🎯 Top-N Rekomendasi Produk Fashion")
        st.markdown("Sistem merekomendasikan produk untuk mendukung keputusan **stok dan display toko** tim merchandising H&M.")

        if run_button or True:
            with st.spinner("Menghitung rekomendasi..."):
                hasil = rekomendasi_hybrid(
                    selected_customer,
                    top_n=top_n,
                    w_cf=w_cf,
                    w_cbf=w_cbf
                )

            if len(hasil) == 0:
                st.warning("Customer tidak ditemukan atau tidak ada rekomendasi.")
            else:
                # Info customer
                st.markdown(f"**Customer ID:** `{selected_customer[:40]}...`")

                # Histori pembelian customer
                histori = ratings[ratings['customer_id'] == selected_customer]
                col1, col2, col3 = st.columns(3)
                with col1:
                    st.metric("Total Transaksi", f"{len(histori):,}")
                with col2:
                    st.metric("Produk Unik Dibeli", f"{histori['article_id'].nunique():,}")
                with col3:
                    st.metric("Produk Direkomendasikan", f"{len(hasil)}")

                st.markdown("---")

                # Kartu rekomendasi
                st.markdown("#### 📦 Hasil Rekomendasi")
                for _, row in hasil.iterrows():
                    col_info, col_score = st.columns([3, 1])
                    with col_info:
                        st.markdown(f"""
                        <div class="rec-card">
                            <strong>#{row.name} {row['Product Name']}</strong><br>
                            <small>🏷️ {row['Category']} &nbsp;|&nbsp; 🎨 {row['Colour']} &nbsp;|&nbsp; 🆔 {row['Article ID']}</small>
                        </div>
                        """, unsafe_allow_html=True)
                    with col_score:
                        st.markdown(f"""
                        <div style="text-align:center; padding-top:0.5rem;">
                            <div class="score-badge">{row['Hybrid Score']:.4f}</div><br>
                            <small>CF: {row['CF Score']:.3f} | CBF: {row['CBF Score']:.3f}</small>
                        </div>
                        """, unsafe_allow_html=True)

                st.markdown("---")

                # Visualisasi Plotly
                st.markdown("#### 📊 Visualisasi Skor Rekomendasi")
                col_v1, col_v2 = st.columns(2)

                with col_v1:
                    fig1 = px.bar(
                        hasil,
                        x='Hybrid Score',
                        y='Product Name',
                        orientation='h',
                        color='Hybrid Score',
                        color_continuous_scale='Reds',
                        title=f'Top-{top_n} Hybrid Score',
                        labels={'Product Name': '', 'Hybrid Score': 'Score'}
                    )
                    fig1.update_layout(
                        height=350,
                        yaxis={'categoryorder': 'total ascending'},
                        coloraxis_showscale=False,
                        plot_bgcolor='rgba(0,0,0,0)',
                        paper_bgcolor='rgba(0,0,0,0)',
                        font_color='white'
                    )
                    st.plotly_chart(fig1, use_container_width=True)

                with col_v2:
                    fig2 = go.Figure()
                    fig2.add_trace(go.Bar(
                        name='CF Score (SVD)',
                        x=hasil['Product Name'].str[:20],
                        y=hasil['CF Score'],
                        marker_color='steelblue'
                    ))
                    fig2.add_trace(go.Bar(
                        name='CBF Score (TF-IDF)',
                        x=hasil['Product Name'].str[:20],
                        y=hasil['CBF Score'],
                        marker_color='coral'
                    ))
                    fig2.update_layout(
                        barmode='stack',
                        title='Kontribusi CF vs CBF',
                        height=350,
                        xaxis_tickangle=-45,
                        plot_bgcolor='rgba(0,0,0,0)',
                        paper_bgcolor='rgba(0,0,0,0)',
                        font_color='white',
                        legend=dict(orientation='h', yanchor='bottom', y=1.02)
                    )
                    st.plotly_chart(fig2, use_container_width=True)

                # Tabel hasil lengkap
                st.markdown("#### 📋 Tabel Hasil Rekomendasi")
                st.dataframe(
                    hasil[['Product Name','Category','Colour','CF Score','CBF Score','Hybrid Score']],
                    use_container_width=True
                )

                # Download
                csv = hasil.to_csv(index=False).encode('utf-8')
                st.download_button(
                    "⬇️ Download Hasil Rekomendasi (CSV)",
                    csv,
                    f"rekomendasi_{selected_customer[:10]}.csv",
                    "text/csv"
                )

    # ── TAB 2: EDA ──────────────────────────────────────────
    with tab2:
        st.markdown("### 📊 Exploratory Data Analysis")

        col_m1, col_m2, col_m3, col_m4 = st.columns(4)
        with col_m1:
            st.metric("Total Artikel", f"{len(articles):,}")
        with col_m2:
            st.metric("Total Transaksi (sample)", f"{len(ratings):,}")
        with col_m3:
            st.metric("Unique Customers", f"{ratings['customer_id'].nunique():,}")
        with col_m4:
            st.metric("Unique Articles Terjual", f"{ratings['article_id'].nunique():,}")

        st.markdown("---")
        col_e1, col_e2 = st.columns(2)

        with col_e1:
            # Top kategori produk
            top_cat = articles['product_group_name'].value_counts().head(10)
            fig_cat = px.bar(
                x=top_cat.values,
                y=top_cat.index,
                orientation='h',
                title='Top 10 Kategori Produk',
                color=top_cat.values,
                color_continuous_scale='Blues',
                labels={'x': 'Jumlah Artikel', 'y': ''}
            )
            fig_cat.update_layout(
                height=400, coloraxis_showscale=False,
                plot_bgcolor='rgba(0,0,0,0)',
                paper_bgcolor='rgba(0,0,0,0)',
                font_color='white'
            )
            fig_cat.update_yaxes(categoryorder='total ascending')
            st.plotly_chart(fig_cat, use_container_width=True)

        with col_e2:
            # Top warna produk
            top_colour = articles['colour_group_name'].value_counts().head(10)
            fig_col = px.pie(
                values=top_colour.values,
                names=top_colour.index,
                title='Distribusi Top 10 Warna Produk',
                hole=0.4
            )
            fig_col.update_layout(
                height=400,
                plot_bgcolor='rgba(0,0,0,0)',
                paper_bgcolor='rgba(0,0,0,0)',
                font_color='white'
            )
            st.plotly_chart(fig_col, use_container_width=True)

        # Distribusi rating
        rating_dist = ratings['rating'].value_counts().sort_index()
        fig_rating = px.bar(
            x=rating_dist.index,
            y=rating_dist.values,
            title='Distribusi Rating Implisit (Frekuensi Pembelian)',
            labels={'x': 'Rating (Frekuensi Beli)', 'y': 'Jumlah'},
            color=rating_dist.values,
            color_continuous_scale='Purples'
        )
        fig_rating.update_layout(
            height=300, coloraxis_showscale=False,
            plot_bgcolor='rgba(0,0,0,0)',
            paper_bgcolor='rgba(0,0,0,0)',
            font_color='white'
        )
        st.plotly_chart(fig_rating, use_container_width=True)

    # ── TAB 3: EVALUASI ─────────────────────────────────────
    with tab3:
        st.markdown("### 📈 Evaluasi Sistem Rekomendasi")
        st.markdown("Perbandingan performa **Collaborative Filtering**, **Content-Based Filtering**, dan **Hybrid**.")

        st.info("💡 Klik tombol di bawah untuk menjalankan evaluasi (membutuhkan beberapa menit)")

        if st.button("▶️ Jalankan Evaluasi (100 customer)", type="primary"):
            with st.spinner("Mengevaluasi sistem... harap tunggu..."):
                precision_list, recall_list = [], []
                cf_prec, cbf_prec           = [], []

                test_customers = [
                    c for c in valid_customers[:100]
                    if len(ratings[ratings['customer_id']==c]) >= 2
                ]

                progress = st.progress(0)
                for idx_t, cust in enumerate(test_customers):
                    progress.progress((idx_t+1) / len(test_customers))
                    ground_truth = ratings[
                        ratings['customer_id'] == cust
                    ].nlargest(1, 'rating')['article_id'].values[0]

                    # Hybrid
                    h = rekomendasi_hybrid(cust, top_n=5)
                    if len(h) > 0:
                        hit = 1 if ground_truth in h['Article ID'].tolist() else 0
                        precision_list.append(hit / 5)
                        recall_list.append(float(hit))

                    # CF only
                    cf_r = rekomendasi_hybrid(cust, top_n=5, w_cf=1.0, w_cbf=0.0)
                    if len(cf_r) > 0:
                        hit = 1 if ground_truth in cf_r['Article ID'].tolist() else 0
                        cf_prec.append(hit / 5)

                    # CBF only
                    sudah = ratings[ratings['customer_id']==cust]['article_id'].tolist()
                    if sudah:
                        cbf_r = rekomendasi_cbf(str(sudah[0]).zfill(10), top_n=5)
                        if len(cbf_r) > 0:
                            hit = 1 if ground_truth in cbf_r['Article ID'].tolist() else 0
                            cbf_prec.append(hit / 5)

                precision = np.mean(precision_list) if precision_list else 0
                recall    = np.mean(recall_list)    if recall_list    else 0
                f1        = 2*precision*recall/(precision+recall+1e-9)

                # Tampilkan metrik
                col_r1, col_r2, col_r3 = st.columns(3)
                with col_r1:
                    st.metric("Precision@5", f"{precision:.4f}", f"{precision*100:.1f}%")
                with col_r2:
                    st.metric("Recall@5", f"{recall:.4f}", f"{recall*100:.1f}%")
                with col_r3:
                    st.metric("F1-Score@5", f"{f1:.4f}", f"{f1*100:.1f}%")

                st.markdown("---")

                # Perbandingan metode
                methods = ['CF (SVD)', 'CBF (TF-IDF)', 'Hybrid']
                scores  = [
                    np.mean(cf_prec)   if cf_prec   else 0,
                    np.mean(cbf_prec)  if cbf_prec  else 0,
                    precision
                ]
                fig_eval = px.bar(
                    x=methods, y=scores,
                    title='Perbandingan Precision@5: CF vs CBF vs Hybrid',
                    color=scores,
                    color_continuous_scale='RdYlGn',
                    labels={'x': 'Metode', 'y': 'Precision@5'},
                    text=[f'{s:.4f}' for s in scores]
                )
                fig_eval.update_traces(textposition='outside')
                fig_eval.update_layout(
                    height=400, coloraxis_showscale=False,
                    plot_bgcolor='rgba(0,0,0,0)',
                    paper_bgcolor='rgba(0,0,0,0)',
                    font_color='white'
                )
                st.plotly_chart(fig_eval, use_container_width=True)

    # ── TAB 4: TENTANG ──────────────────────────────────────
    with tab4:
        st.markdown("### ℹ️ Tentang Sistem Rekomendasi Ini")

        col_a1, col_a2 = st.columns(2)
        with col_a1:
            st.markdown("""
            #### 📋 Informasi Proyek
            | | |
            |---|---|
            | **Nama** | Linda Anggara Wati |
            | **NRP** | 3324600008 |
            | **Mata Kuliah** | Sistem Rekomendasi |
            | **Semester** | Genap TA. 2025/2026 |
            | **Topik** | Industri |

            #### 📚 Dataset
            - **Sumber:** H&M Personalized Fashion Recommendations (Kaggle, 2022)
            - **Artikel:** 105.542 produk fashion
            - **Customer:** 1.371.980 customer
            - **Transaksi:** 31.788.324 (sample 500K)
            - **Periode:** Sep 2018 – Sep 2020
            """)

        with col_a2:
            st.markdown("""
            #### 🔧 Metodologi
            1. Pengumpulan Dataset H&M
            2. Preprocessing & Stratified Sampling
            3. EDA
            4. Pembangunan User-Item Interaction Matrix
            5. Content Feature Engineering (7 fitur TF-IDF)
            6. Collaborative Filtering — **SVD** (Matrix Factorization)
            7. Content-Based Filtering — **TF-IDF + Cosine Similarity**
            8. Hybrid Score = **0.6×CF + 0.4×CBF**
            9. Ranking Top-N Recommendation
            10. Evaluasi (Precision@K, Recall@K, F1)
            11. Dashboard Streamlit *(halaman ini)*

            #### 🌱 SDGs 9 — Industri, Inovasi, Infrastruktur
            Sistem ini mendukung efisiensi industri tekstil melalui
            inovasi digital berbasis machine learning, selaras dengan
            target SDGs 9.2 dan 9.5.
            """)

        st.markdown("---")
        st.markdown("""
        #### 📖 Referensi Utama
        1. Koren, Y., Bell, R., & Volinsky, C. (2009). *Matrix Factorization Techniques for Recommender Systems*. IEEE Computer.
        2. Lops, P., de Gemmis, M., & Semeraro, G. (2011). *Content-based Recommender Systems: State of the Art and Trends*. Springer.
        3. Burke, R. (2002). *Hybrid Recommender Systems: Survey and Experiments*. User Modeling and User-Adapted Interaction.
        """)

else:
    st.error("❌ Jalankan notebook `recsys_fashion.ipynb` terlebih dahulu untuk generate model dan data.")
    st.markdown("""
    **Langkah yang harus dilakukan:**
    1. Buka `recsys_fashion.ipynb` di Jupyter/VS Code
    2. Jalankan semua cell dari atas sampai bawah
    3. Pastikan file berikut sudah terbuat:
       - `model_svd.pkl`
       - `model_tfidf.pkl`
       - `model_cossim.pkl`
       - `model_articleidx.pkl`
       - `data_articles.parquet`
       - `data_sample_articles.parquet`
       - `data_ratings.parquet`
       - `valid_customers.json`
    4. Jalankan dashboard: `streamlit run dashboard.py`
    """)
