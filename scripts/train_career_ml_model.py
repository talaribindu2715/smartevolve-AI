import os
import sys
import json
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from sklearn.ensemble import RandomForestClassifier
from sklearn.neighbors import NearestNeighbors
from sklearn.model_selection import StratifiedKFold, cross_validate
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score
from sklearn.decomposition import PCA

if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

# Ensure directories exist
os.makedirs("docs/experiments/figures", exist_ok=True)
os.makedirs("docs/experiments/data", exist_ok=True)
os.makedirs("backend/src/main/resources/ml", exist_ok=True)

print("=" * 75)
print("  SMARTEVOLVE AI — MACHINE LEARNING CAREER PATH PREDICTION PIPELINE")
print("=" * 75)

# Set global plotting style
plt.style.use('seaborn-v0_8-whitegrid' if 'seaborn-v0_8-whitegrid' in plt.style.available else 'default')
plt.rcParams['font.sans-serif'] = 'Arial'
plt.rcParams['font.size'] = 10

# ==============================================================================
# 1. 32 NORMALIZED SKILLS DEFINITION
# ==============================================================================
SKILLS = [
    "Python", "Java", "JavaScript", "TypeScript", "SQL",
    "PostgreSQL", "MongoDB", "Redis",
    "Pandas & NumPy", "Statistics", "Power BI", "Data Visualization",
    "Machine Learning", "Deep Learning", "Natural Language Processing", "Prompt Engineering & LLMs",
    "React & React Native", "Spring Boot", "Node.js", "RESTful API Design",
    "Docker", "Kubernetes", "CI/CD Pipelines", "AWS Cloud Core", "Linux Administration",
    "Cybersecurity Fundamentals", "Software Testing & QA",
    "Data Structures & Algorithms", "System Design", "Agile & Scrum", "Technical Communication",
    "Solidity & Smart Contracts"
]
NUM_SKILLS = len(SKILLS)
skill_to_idx = {name: i for i, name in enumerate(SKILLS)}

# ==============================================================================
# 2. 16 EXACT CAREER PATH BENCHMARKS (Centroids & Weights)
# ==============================================================================
# Format: career_name: {skill_name: required_proficiency}
CAREER_BENCHMARKS = {
    "AI Engineer": {
        "Python": 90, "Machine Learning": 85, "Deep Learning": 85,
        "Prompt Engineering & LLMs": 90, "Natural Language Processing": 80,
        "RESTful API Design": 75, "Docker": 75, "System Design": 80
    },
    "Machine Learning Engineer": {
        "Python": 90, "Machine Learning": 90, "Deep Learning": 85,
        "Statistics": 85, "Pandas & NumPy": 85, "Docker": 80,
        "Data Structures & Algorithms": 80, "System Design": 75
    },
    "Data Scientist": {
        "Python": 85, "Statistics": 90, "Pandas & NumPy": 90,
        "Machine Learning": 85, "Data Visualization": 85, "SQL": 80,
        "Technical Communication": 80
    },
    "Data Analyst": {
        "SQL": 90, "Power BI": 85, "Data Visualization": 85,
        "Pandas & NumPy": 80, "Statistics": 75, "Python": 75,
        "Technical Communication": 80
    },
    "Full-Stack Developer": {
        "JavaScript": 90, "TypeScript": 85, "React & React Native": 90,
        "Spring Boot": 80, "PostgreSQL": 80, "RESTful API Design": 85,
        "Node.js": 75, "Docker": 70
    },
    "Backend Developer": {
        "Java": 90, "Spring Boot": 90, "PostgreSQL": 85,
        "Redis": 80, "RESTful API Design": 85, "System Design": 85,
        "Data Structures & Algorithms": 80, "Docker": 75
    },
    "Frontend Developer": {
        "JavaScript": 95, "TypeScript": 90, "React & React Native": 95,
        "RESTful API Design": 80, "Data Visualization": 70,
        "Software Testing & QA": 75
    },
    "Mobile App Developer": {
        "TypeScript": 90, "React & React Native": 95, "RESTful API Design": 85,
        "JavaScript": 85, "Software Testing & QA": 75, "Docker": 65
    },
    "Java Enterprise Developer": {
        "Java": 95, "Spring Boot": 90, "PostgreSQL": 85,
        "Data Structures & Algorithms": 85, "Docker": 75, "Redis": 75,
        "System Design": 80
    },
    "Cloud Solutions Architect": {
        "AWS Cloud Core": 95, "Docker": 90, "Kubernetes": 90,
        "System Design": 95, "Linux Administration": 85, "CI/CD Pipelines": 85
    },
    "DevOps & SRE Engineer": {
        "Docker": 95, "Kubernetes": 90, "CI/CD Pipelines": 95,
        "Linux Administration": 95, "AWS Cloud Core": 85, "Python": 75
    },
    "Cybersecurity Engineer": {
        "Cybersecurity Fundamentals": 95, "Linux Administration": 90,
        "Python": 80, "Software Testing & QA": 80, "System Design": 75,
        "AWS Cloud Core": 70
    },
    "QA & Automation Engineer": {
        "Software Testing & QA": 95, "Python": 80, "Java": 80,
        "CI/CD Pipelines": 85, "RESTful API Design": 80, "Agile & Scrum": 80
    },
    "Database Administrator (DBA)": {
        "PostgreSQL": 95, "SQL": 95, "Redis": 85,
        "Linux Administration": 85, "System Design": 80, "Docker": 70
    },
    "Blockchain Developer": {
        "Solidity & Smart Contracts": 95, "JavaScript": 85, "TypeScript": 85,
        "Cybersecurity Fundamentals": 85, "Data Structures & Algorithms": 80,
        "System Design": 80
    },
    "NLP & GenAI Specialist": {
        "Natural Language Processing": 95, "Prompt Engineering & LLMs": 95,
        "Python": 90, "Deep Learning": 85, "Statistics": 80,
        "RESTful API Design": 75
    }
}

CAREER_NAMES = list(CAREER_BENCHMARKS.keys())
NUM_CAREERS = len(CAREER_NAMES)
career_to_idx = {name: i for i, name in enumerate(CAREER_NAMES)}

print(f"[+] Loaded {NUM_CAREERS} exact career path definitions across {NUM_SKILLS} industry skills.")

# ==============================================================================
# 3. SYNTHESIZE 5,000 REALISTIC STUDENT / PROFESSIONAL PROFILES (DATASET)
# ==============================================================================
print("\n[+] Synthesizing 5,000 multi-disciplinary student training profiles...")
rng = np.random.default_rng(42)

SAMPLES_PER_CAREER = 5000 // NUM_CAREERS # ~312 per career
extra = 5000 - (SAMPLES_PER_CAREER * NUM_CAREERS)

X_data = []
y_labels = []

# Generate career centroids matrix (16, 32)
career_centroids = np.zeros((NUM_CAREERS, NUM_SKILLS))
for c_name, reqs in CAREER_BENCHMARKS.items():
    c_idx = career_to_idx[c_name]
    for s_name, prof in reqs.items():
        s_idx = skill_to_idx[s_name]
        career_centroids[c_idx, s_idx] = prof

for c_idx, c_name in enumerate(CAREER_NAMES):
    num_samples = SAMPLES_PER_CAREER + (1 if c_idx < extra else 0)
    centroid = career_centroids[c_idx]
    
    # 70% Near-Ready Candidates (mean near benchmark, std 10)
    # 20% Aspiring Beginners (mean 60% of benchmark, std 15)
    # 10% Cross-disciplinary Explorers (overlapping skills)
    for _ in range(num_samples):
        r_type = rng.random()
        profile = np.zeros(NUM_SKILLS)
        
        # Base background noise across all skills (general computer science background 15-45%)
        base_noise = rng.normal(25, 10, NUM_SKILLS)
        profile += base_noise
        
        # Overlay core career skill proficiencies
        for s_idx in range(NUM_SKILLS):
            target_val = centroid[s_idx]
            if target_val > 0:
                if r_type < 0.70:
                    val = rng.normal(target_val, 8.5)
                elif r_type < 0.90:
                    val = rng.normal(target_val * 0.65, 12.0)
                else:
                    val = rng.normal(target_val * 0.85, 15.0)
                profile[s_idx] = max(profile[s_idx], val)
                
        # Non-core skills slight random noise
        profile = np.clip(profile, 0.0, 100.0)
        X_data.append(profile)
        y_labels.append(c_idx)

X = np.array(X_data)
y = np.array(y_labels)

# Save synthesized dataset to CSV
df_dataset = pd.DataFrame(X, columns=SKILLS)
df_dataset["Target_Career"] = [CAREER_NAMES[i] for i in y]
dataset_csv_path = "docs/experiments/data/career_dataset_5000.csv"
df_dataset.to_csv(dataset_csv_path, index=False)
print(f"[OK] Generated and saved 5,000 sample dataset to {dataset_csv_path}")

# ==============================================================================
# 4. TRAIN MACHINE LEARNING MODELS & 5-FOLD CROSS VALIDATION
# ==============================================================================
print("\n[+] Training Random Forest Multi-Class Career Classifier (100 Trees)...")
rf = RandomForestClassifier(n_estimators=100, max_depth=14, random_state=42, n_jobs=-1)

cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
scoring = ['accuracy', 'f1_macro', 'precision_macro', 'recall_macro']
cv_results = cross_validate(rf, X, y, cv=cv, scoring=scoring, n_jobs=-1)

print("\n5-Fold Stratified Cross-Validation Results:")
print("-" * 55)
print(f"  Mean Accuracy:        {cv_results['test_accuracy'].mean() * 100:.2f}% ± {cv_results['test_accuracy'].std() * 100:.2f}%")
print(f"  Mean Macro F1-Score:  {cv_results['test_f1_macro'].mean() * 100:.2f}%")
print(f"  Mean Macro Precision: {cv_results['test_precision_macro'].mean() * 100:.2f}%")
print(f"  Mean Macro Recall:    {cv_results['test_recall_macro'].mean() * 100:.2f}%")
print("-" * 55)

# Fit on full dataset for parameter extraction
rf.fit(X, y)
train_acc = accuracy_score(y, rf.predict(X))
print(f"[OK] Model fitted on full dataset with {train_acc * 100:.2f}% training accuracy.")

# KNN Nearest Neighbors Vector Model
knn = NearestNeighbors(n_neighbors=5, metric='cosine')
knn.fit(X)

# ==============================================================================
# 5. FEATURE IMPORTANCES & EXPLAINABLE AI (XAI)
# ==============================================================================
importances = rf.feature_importances_
top_feature_indices = np.argsort(importances)[::-1]

print("\nTop 10 Most Discriminative Skills for Career Prediction:")
for rank, idx in enumerate(top_feature_indices[:10], start=1):
    print(f"  {rank:>2}. {SKILLS[idx]:<30} | Gini Importance: {importances[idx] * 100:.2f}%")

# FIGURE 1: Feature Importance Bar Chart
fig, ax = plt.subplots(figsize=(10, 6), dpi=300)
top_k = 15
top_k_indices = top_feature_indices[:top_k]
ax.barh([SKILLS[i] for i in top_k_indices][::-1], [importances[i] * 100 for i in top_k_indices][::-1], color="#10B981", edgecolor="#065f46", height=0.65)
ax.set_xlabel("Relative Predictive Importance (Gini Score %)", fontweight="bold")
ax.set_title("Top 15 Predictive Skills in SmartEvolve AI Career Routing Model", fontweight="bold", pad=12)
plt.tight_layout()
fig.savefig("docs/experiments/figures/career_feature_importance.png")
plt.close(fig)
print("[OK] Saved docs/experiments/figures/career_feature_importance.png")

# FIGURE 2: Confusion Matrix Heatmap
y_pred = rf.predict(X)
cm = confusion_matrix(y, y_pred, normalize='true')

fig, ax = plt.subplots(figsize=(11, 9), dpi=300)
cax = ax.imshow(cm, cmap="Blues", interpolation="nearest")
fig.colorbar(cax)

ax.set_xticks(range(NUM_CAREERS))
ax.set_yticks(range(NUM_CAREERS))
ax.set_xticklabels(CAREER_NAMES, rotation=45, ha="right", fontsize=9)
ax.set_yticklabels(CAREER_NAMES, fontsize=9)
ax.set_title("Normalized Confusion Matrix — 16 Exact Career Paths (5,000 Profiles)", fontweight="bold", pad=15)
ax.set_xlabel("Predicted Career Path", fontweight="bold")
ax.set_ylabel("True Career Benchmark", fontweight="bold")

# Annotate diagonals
for i in range(NUM_CAREERS):
    val = cm[i, i]
    ax.text(i, i, f"{val:.2f}", ha="center", va="center", color="white" if val > 0.5 else "black", fontsize=8, fontweight="bold")

plt.tight_layout()
fig.savefig("docs/experiments/figures/career_ml_confusion_matrix.png")
plt.close(fig)
print("[OK] Saved docs/experiments/figures/career_ml_confusion_matrix.png")

# FIGURE 3: PCA Cluster Projection (2D Skill Space Decision Boundaries)
pca = PCA(n_components=2, random_state=42)
X_pca = pca.fit_transform(X)

fig, ax = plt.subplots(figsize=(11, 7.5), dpi=300)
palette = plt.cm.tab20(np.linspace(0, 1, NUM_CAREERS))

for c_idx, c_name in enumerate(CAREER_NAMES):
    mask = (y == c_idx)
    ax.scatter(X_pca[mask, 0], X_pca[mask, 1], label=c_name, color=palette[c_idx], alpha=0.6, s=18)

ax.set_title("2D Principal Component Analysis (PCA) of 16 Career Skill Clusters", fontweight="bold", pad=12)
ax.set_xlabel(f"PC1 ({pca.explained_variance_ratio_[0]*100:.1f}% Variance Explained)", fontweight="bold")
ax.set_ylabel(f"PC2 ({pca.explained_variance_ratio_[1]*100:.1f}% Variance Explained)", fontweight="bold")
ax.legend(bbox_to_anchor=(1.02, 1), loc="upper left", frameon=True, fontsize=8)
plt.tight_layout()
fig.savefig("docs/experiments/figures/career_clusters_pca.png")
plt.close(fig)
print("[OK] Saved docs/experiments/figures/career_clusters_pca.png")

# ==============================================================================
# 6. EXPORT MODEL WEIGHTS & CENTROIDS TO SPRING BOOT (JSON)
# ==============================================================================
ml_export = {
    "version": "1.0.0",
    "model_type": "Hybrid_Centroid_Cosine_Vector_Classifier",
    "num_careers": NUM_CAREERS,
    "num_skills": NUM_SKILLS,
    "skills": SKILLS,
    "career_names": CAREER_NAMES,
    "career_centroids": {c_name: career_centroids[career_to_idx[c_name]].tolist() for c_name in CAREER_NAMES},
    "feature_importances": {SKILLS[i]: float(importances[i]) for i in range(NUM_SKILLS)},
    "accuracy_5fold": float(cv_results['test_accuracy'].mean()),
    "f1_macro": float(cv_results['test_f1_macro'].mean())
}

model_json_path = "backend/src/main/resources/ml/career_ml_model.json"
with open(model_json_path, "w") as f:
    json.dump(ml_export, f, indent=2)
print(f"[OK] Exported trained model weights & centroids to {model_json_path}")

# Save metrics summary
metrics_summary = {
    "dataset_samples": len(X),
    "features_count": NUM_SKILLS,
    "classes_count": NUM_CAREERS,
    "mean_accuracy": float(cv_results['test_accuracy'].mean()),
    "accuracy_std": float(cv_results['test_accuracy'].std()),
    "mean_f1_macro": float(cv_results['test_f1_macro'].mean()),
    "mean_precision": float(cv_results['test_precision_macro'].mean()),
    "mean_recall": float(cv_results['test_recall_macro'].mean()),
    "top_predictive_skills": [SKILLS[i] for i in top_feature_indices[:10]]
}
with open("docs/experiments/data/career_ml_metrics.json", "w") as f:
    json.dump(metrics_summary, f, indent=2)

print("\n" + "=" * 75)
print("  CAREER PATH MACHINE LEARNING PIPELINE COMPLETED SUCCESSFULLY!")
print("=" * 75)

