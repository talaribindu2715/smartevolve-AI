import os
import sys
import time
import json
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt

if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

# Create directories
os.makedirs("docs/experiments/figures", exist_ok=True)
os.makedirs("docs/experiments/data", exist_ok=True)

print("=" * 70)
print("  SMARTEVOLVE AI — EXPERIMENTAL SIMULATION & ALGORITHM BENCHMARK")
print("=" * 70)

# Set global plotting style
plt.style.use('seaborn-v0_8-whitegrid' if 'seaborn-v0_8-whitegrid' in plt.style.available else 'default')
plt.rcParams['font.sans-serif'] = 'Arial'
plt.rcParams['font.size'] = 11
plt.rcParams['axes.titlesize'] = 13
plt.rcParams['axes.labelsize'] = 12

# ==============================================================================
# 1. SIMULATION SETUP (2,000 LEARNERS x 10 RANDOM SEEDS)
# ==============================================================================
NUM_LEARNERS = 2000
SEEDS = list(range(1000, 1010))  # Fixed random seeds (1000–1009 for main comparison per paper Section III-G)
NUM_ATTEMPTS = 20

# Algorithm 1: Damped Rate (SmartEvolve AI algorithm)
def update_damped(prev_prof, score, difficulty, attempt):
    base_rate = 0.45 if difficulty == "ADVANCED" else (0.25 if difficulty == "BEGINNER" else 0.35)
    damping = 1.0 / np.sqrt(max(1, attempt))
    effective_rate = base_rate * damping
    delta = (score - prev_prof) * effective_rate
    if score >= 85.0 and difficulty == "ADVANCED":
        delta += 3.0
    return np.clip(prev_prof + delta, 0.0, 100.0)

# Algorithm 2: Constant Rate
def update_constant(prev_prof, score, difficulty, attempt):
    base_rate = 0.45 if difficulty == "ADVANCED" else (0.25 if difficulty == "BEGINNER" else 0.35)
    delta = (score - prev_prof) * base_rate
    return np.clip(prev_prof + delta, 0.0, 100.0)

# Algorithm 3: Running Mean (Cumulative Average)
def update_running_mean(prev_prof, score, attempt, initial_prof):
    # Recalculates mean of all attempts including baseline
    return np.clip(prev_prof + (score - prev_prof) / (attempt + 1), 0.0, 100.0)

print(f"\n[+] Running 2,000 learners across {len(SEEDS)} random seeds ({NUM_LEARNERS * len(SEEDS):,} learner runs per algorithm)...")

# Store aggregate results: seed -> algo -> (num_learners, num_attempts)
mae_by_algo_step = {
    "Damped": np.zeros((len(SEEDS), NUM_ATTEMPTS)),
    "Constant Rate": np.zeros((len(SEEDS), NUM_ATTEMPTS)),
    "Running Mean": np.zeros((len(SEEDS), NUM_ATTEMPTS))
}

rmse_by_algo_step = {
    "Damped": np.zeros((len(SEEDS), NUM_ATTEMPTS)),
    "Constant Rate": np.zeros((len(SEEDS), NUM_ATTEMPTS)),
    "Running Mean": np.zeros((len(SEEDS), NUM_ATTEMPTS))
}

volatility_by_algo = {"Damped": [], "Constant Rate": [], "Running Mean": []}
final_errors_by_algo = {"Damped": [], "Constant Rate": [], "Running Mean": []}

start_sim = time.time()

for s_idx, seed in enumerate(SEEDS):
    rng = np.random.default_rng(seed)
    
    # 1. Synthesize 2,000 learners with diverse latent abilities (Mixture of 3 populations)
    # 35% Novice (mean 32, std 8), 45% Intermediate (mean 62, std 10), 20% Advanced (mean 86, std 6)
    subpop_counts = [int(0.35 * NUM_LEARNERS), int(0.45 * NUM_LEARNERS), NUM_LEARNERS - int(0.35 * NUM_LEARNERS) - int(0.45 * NUM_LEARNERS)]
    theta_novice = rng.normal(32, 8, subpop_counts[0])
    theta_inter = rng.normal(62, 10, subpop_counts[1])
    theta_adv = rng.normal(86, 6, subpop_counts[2])
    true_thetas = np.concatenate([theta_novice, theta_inter, theta_adv])
    true_thetas = np.clip(true_thetas, 5.0, 98.0)
    rng.shuffle(true_thetas)
    
    # Initial self-reported proficiencies (with cognitive bias / noise)
    initial_reports = true_thetas + rng.normal(5, 12, NUM_LEARNERS)
    initial_reports = np.clip(initial_reports, 10.0, 95.0)
    
    # Trajectories for each algorithm: shape (NUM_LEARNERS, NUM_ATTEMPTS)
    damped_prof = np.zeros((NUM_LEARNERS, NUM_ATTEMPTS))
    constant_prof = np.zeros((NUM_LEARNERS, NUM_ATTEMPTS))
    mean_prof = np.zeros((NUM_LEARNERS, NUM_ATTEMPTS))
    
    # Simulate step-by-step
    curr_damped = initial_reports.copy()
    curr_constant = initial_reports.copy()
    curr_mean = initial_reports.copy()
    
    difficulties = ["BEGINNER", "INTERMEDIATE", "ADVANCED"]
    diff_probs = [0.30, 0.45, 0.25]
    
    for t in range(1, NUM_ATTEMPTS + 1):
        # Sample assessment difficulties and observed scores
        step_diffs = rng.choice(difficulties, size=NUM_LEARNERS, p=diff_probs)
        
        # Difficulty penalty: Advanced is harder than true ability, Beginner is slightly easier
        diff_offsets = np.where(step_diffs == "ADVANCED", -6.0, np.where(step_diffs == "BEGINNER", 4.0, 0.0))
        
        # Test performance variation (test noise, variance in questions)
        noise = rng.normal(0, 7.5, NUM_LEARNERS)
        observed_scores = np.clip(true_thetas + diff_offsets + noise, 0.0, 100.0)
        
        # Update each algorithm
        new_damped = np.zeros(NUM_LEARNERS)
        new_constant = np.zeros(NUM_LEARNERS)
        new_mean = np.zeros(NUM_LEARNERS)
        
        for i in range(NUM_LEARNERS):
            new_damped[i] = update_damped(curr_damped[i], observed_scores[i], step_diffs[i], t)
            new_constant[i] = update_constant(curr_constant[i], observed_scores[i], step_diffs[i], t)
            new_mean[i] = update_running_mean(curr_mean[i], observed_scores[i], t, initial_reports[i])
        
        # Record trajectories
        damped_prof[:, t - 1] = new_damped
        constant_prof[:, t - 1] = new_constant
        mean_prof[:, t - 1] = new_mean
        
        # Calculate step metrics across all 2,000 learners
        mae_by_algo_step["Damped"][s_idx, t - 1] = np.mean(np.abs(new_damped - true_thetas))
        mae_by_algo_step["Constant Rate"][s_idx, t - 1] = np.mean(np.abs(new_constant - true_thetas))
        mae_by_algo_step["Running Mean"][s_idx, t - 1] = np.mean(np.abs(new_mean - true_thetas))
        
        rmse_by_algo_step["Damped"][s_idx, t - 1] = np.sqrt(np.mean((new_damped - true_thetas) ** 2))
        rmse_by_algo_step["Constant Rate"][s_idx, t - 1] = np.sqrt(np.mean((new_constant - true_thetas) ** 2))
        rmse_by_algo_step["Running Mean"][s_idx, t - 1] = np.sqrt(np.mean((new_mean - true_thetas) ** 2))
        
        curr_damped = new_damped
        curr_constant = new_constant
        curr_mean = new_mean

    # Late-stage volatility (attempts 10 to 20): standard deviation of step changes
    damped_step_deltas = np.abs(np.diff(damped_prof[:, 9:], axis=1))
    constant_step_deltas = np.abs(np.diff(constant_prof[:, 9:], axis=1))
    mean_step_deltas = np.abs(np.diff(mean_prof[:, 9:], axis=1))
    
    volatility_by_algo["Damped"].append(np.mean(damped_step_deltas))
    volatility_by_algo["Constant Rate"].append(np.mean(constant_step_deltas))
    volatility_by_algo["Running Mean"].append(np.mean(mean_step_deltas))
    
    final_errors_by_algo["Damped"].extend((curr_damped - true_thetas).tolist())
    final_errors_by_algo["Constant Rate"].extend((curr_constant - true_thetas).tolist())
    final_errors_by_algo["Running Mean"].extend((curr_mean - true_thetas).tolist())

sim_duration = time.time() - start_sim
print(f"[OK] Completed simulation of 2,000 learners x 10 seeds (20,000 learner trajectories) in {sim_duration:.2f}s!")

# ==============================================================================
# 2. STATISTICAL SUMMARY & METRIC AGGREGATION
# ==============================================================================
attempts_range = np.arange(1, NUM_ATTEMPTS + 1)

summary_stats = {}
for algo in ["Damped", "Constant Rate", "Running Mean"]:
    mean_mae = np.mean(mae_by_algo_step[algo], axis=0)
    std_mae = np.std(mae_by_algo_step[algo], axis=0)
    mean_rmse = np.mean(rmse_by_algo_step[algo], axis=0)
    std_rmse = np.std(rmse_by_algo_step[algo], axis=0)
    
    summary_stats[algo] = {
        "Initial_MAE": float(mean_mae[0]),
        "Final_MAE": float(mean_mae[-1]),
        "Final_MAE_Std": float(std_mae[-1]),
        "Initial_RMSE": float(mean_rmse[0]),
        "Final_RMSE": float(mean_rmse[-1]),
        "Final_RMSE_Std": float(std_rmse[-1]),
        "Mean_Volatility": float(np.mean(volatility_by_algo[algo])),
        "Volatility_Std": float(np.std(volatility_by_algo[algo])),
        "Convergence_Step_5Pct": int(np.where(mean_mae <= 5.5)[0][0] + 1) if np.any(mean_mae <= 5.5) else -1
    }

print("\nAlgorithm Comparison Results (Averaged across 10 Seeds & 2,000 Learners):")
print("-" * 75)
print(f"{'Algorithm':<15} | {'Final MAE':<12} | {'Final RMSE':<12} | {'Late Volatility':<16} | {'Convergence'}")
print("-" * 75)
for algo, s in summary_stats.items():
    print(f"{algo:<15} | {s['Final_MAE']:>5.2f} ± {s['Final_MAE_Std']:>4.2f} | {s['Final_RMSE']:>5.2f} ± {s['Final_RMSE_Std']:>4.2f} | {s['Mean_Volatility']:>6.2f} ± {s['Volatility_Std']:>4.2f} pts | Step {s['Convergence_Step_5Pct']}")
print("-" * 75)

# Save JSON metrics summary
with open("docs/experiments/data/simulation_metrics_summary.json", "w") as f:
    json.dump(summary_stats, f, indent=2)

# Save trajectory CSV
df_trajectory = pd.DataFrame({
    "Attempt": attempts_range,
    "Damped_MAE": np.mean(mae_by_algo_step["Damped"], axis=0),
    "Constant_MAE": np.mean(mae_by_algo_step["Constant Rate"], axis=0),
    "RunningMean_MAE": np.mean(mae_by_algo_step["Running Mean"], axis=0),
    "Damped_RMSE": np.mean(rmse_by_algo_step["Damped"], axis=0),
    "Constant_RMSE": np.mean(rmse_by_algo_step["Constant Rate"], axis=0),
    "RunningMean_RMSE": np.mean(rmse_by_algo_step["Running Mean"], axis=0),
})
df_trajectory.to_csv("docs/experiments/data/simulation_results.csv", index=False)

# ==============================================================================
# 3. GENERATE HIGH-RESOLUTION FIGURES
# ==============================================================================

# FIGURE 1: MAE Convergence Curve (with 95% Confidence Interval Shading)
fig, ax = plt.subplots(figsize=(9, 5.5), dpi=300)
colors = {"Damped": "#10B981", "Constant Rate": "#EF4444", "Running Mean": "#3B82F6"}

for algo in ["Damped", "Constant Rate", "Running Mean"]:
    mean_val = np.mean(mae_by_algo_step[algo], axis=0)
    std_val = np.std(mae_by_algo_step[algo], axis=0)
    ci_95 = 1.96 * (std_val / np.sqrt(len(SEEDS)))
    ax.plot(attempts_range, mean_val, label=f"{algo} (Final: {mean_val[-1]:.2f})", color=colors[algo], linewidth=2.4)
    ax.fill_between(attempts_range, mean_val - ci_95, mean_val + ci_95, color=colors[algo], alpha=0.18)

ax.axhline(5.0, color="gray", linestyle="--", alpha=0.7, label="5% Error Tolerance Bar")
ax.set_title("Calibration Accuracy Over 20 Attempts (2,000 Learners × 10 Seeds)", fontweight="bold", pad=12)
ax.set_xlabel("Formative Assessment Attempt Number", fontweight="bold")
ax.set_ylabel("Mean Absolute Error (MAE) vs True Ability", fontweight="bold")
ax.set_xlim(1, 20)
ax.set_xticks(range(1, 21))
ax.legend(frameon=True, facecolor="white", edgecolor="#e2e8f0", loc="upper right")
plt.tight_layout()
fig.savefig("docs/experiments/figures/convergence_comparison_mae.png")
plt.close(fig)
print("[OK] Saved docs/experiments/figures/convergence_comparison_mae.png")

# FIGURE 2: Late-Stage Step Volatility (Stability & Exploitation Resistance)
fig, ax = plt.subplots(figsize=(8, 5), dpi=300)
algos = ["Damped", "Constant Rate", "Running Mean"]
vol_means = [summary_stats[a]["Mean_Volatility"] for a in algos]
vol_stds = [summary_stats[a]["Volatility_Std"] for a in algos]
bars = ax.bar(algos, vol_means, yerr=vol_stds, capsize=6, color=["#10B981", "#EF4444", "#3B82F6"], edgecolor="#1e293b", width=0.55)

for bar, val in zip(bars, vol_means):
    yval = bar.get_height()
    ax.text(bar.get_x() + bar.get_width()/2.0, yval + 0.15, f"{val:.2f} pts/step", ha='center', va='bottom', fontweight='bold')

ax.set_title("Late-Stage Rating Volatility (Attempts 10–20)", fontweight="bold", pad=12)
ax.set_ylabel("Average Absolute Change per Assessment (Points)", fontweight="bold")
ax.set_ylim(0, max(vol_means) * 1.3)
plt.tight_layout()
fig.savefig("docs/experiments/figures/score_volatility_late_stage.png")
plt.close(fig)
print("[OK] Saved docs/experiments/figures/score_volatility_late_stage.png")

# FIGURE 3: Final Error Distribution (Histogram / Box Plot)
fig, ax = plt.subplots(figsize=(9, 5), dpi=300)
error_data = [final_errors_by_algo["Damped"], final_errors_by_algo["Constant Rate"], final_errors_by_algo["Running Mean"]]
bp = ax.boxplot(error_data, patch_artist=True, labels=["Damped (SmartEvolve)", "Constant Rate", "Running Mean"], showfliers=False, widths=0.5)

colors_bp = ["#10B981", "#EF4444", "#3B82F6"]
for patch, color in zip(bp['boxes'], colors_bp):
    patch.set_facecolor(color)
    patch.set_alpha(0.65)
for median in bp['medians']:
    median.set(color='#0f172a', linewidth=2)

ax.axhline(0, color="gray", linestyle="--", alpha=0.6)
ax.set_title("Residual Error Distribution (Estimated Proficiency - True Latent Ability)", fontweight="bold", pad=12)
ax.set_ylabel("Error (Proficiency Points)", fontweight="bold")
plt.tight_layout()
fig.savefig("docs/experiments/figures/population_error_distribution.png")
plt.close(fig)
print("[OK] Saved docs/experiments/figures/population_error_distribution.png")

# ==============================================================================
# 4. PREREQUISITE SEQUENCING PERFORMANCE BENCHMARK (Item 33)
# ==============================================================================
print("\n[+] Benchmarking Kahn's DAG Prerequisite Topological Sort Performance...")

def generate_dag(n_nodes, edge_prob=0.04, seed=42):
    rng = np.random.default_rng(seed)
    # Ensure acyclic by allowing edges only from lower index to higher index: i -> j (i < j)
    adj = {i: [] for i in range(n_nodes)}
    in_degree = {i: 0 for i in range(n_nodes)}
    edge_count = 0
    
    for i in range(n_nodes):
        for j in range(i + 1, min(n_nodes, i + 25)):  # realistic prerequisite window
            if rng.random() < edge_prob:
                adj[i].append(j)
                in_degree[j] += 1
                edge_count += 1
                
    return adj, in_degree, edge_count

def kahns_topological_sort(n_nodes, adj, in_degree):
    deg = in_degree.copy()
    queue = [i for i in range(n_nodes) if deg[i] == 0]
    order = []
    
    while queue:
        curr = queue.pop(0)
        order.append(curr)
        for neighbor in adj[curr]:
            deg[neighbor] -= 1
            if deg[neighbor] == 0:
                queue.append(neighbor)
                
    return order

node_sizes = [10, 25, 50, 100, 250, 500, 1000, 2000, 5000]
dag_benchmarks = []

for n in node_sizes:
    adj, in_deg, edges = generate_dag(n, edge_prob=0.05, seed=123)
    # Warmup
    for _ in range(5):
        kahns_topological_sort(n, adj, in_deg)
    
    # Timing
    trials = 50 if n < 1000 else 15
    times = []
    for _ in range(trials):
        t0 = time.perf_counter()
        order = kahns_topological_sort(n, adj, in_deg)
        t1 = time.perf_counter()
        times.append((t1 - t0) * 1000.0) # ms
    
    mean_time = np.mean(times)
    std_time = np.std(times)
    throughput = (n / (mean_time / 1000.0))
    dag_benchmarks.append({
        "Nodes": n,
        "Edges": edges,
        "Mean_Time_ms": mean_time,
        "Std_Time_ms": std_time,
        "Throughput_Nodes_Per_Sec": throughput
    })
    print(f"  Nodes: {n:<5} | Edges: {edges:<5} | Sort Time: {mean_time:>7.3f} ms | Throughput: {throughput:>10,.0f} nodes/sec")

df_dag = pd.DataFrame(dag_benchmarks)
df_dag.to_csv("docs/experiments/data/prerequisite_dag_benchmark.csv", index=False)

# FIGURE 4: DAG Prerequisite Scaling Curve
fig, ax1 = plt.subplots(figsize=(8.5, 5), dpi=300)
color1 = "#4F46E5"
color2 = "#06B6D4"

ax1.set_xlabel("Number of Learning Resource Nodes in Roadmap", fontweight="bold")
ax1.set_ylabel("Execution Time (milliseconds)", color=color1, fontweight="bold")
line1 = ax1.plot(df_dag["Nodes"], df_dag["Mean_Time_ms"], color=color1, marker="o", linewidth=2.2, label="Sort Execution Time (ms)")
ax1.tick_params(axis="y", labelcolor=color1)

ax2 = ax1.twinx()
ax2.set_ylabel("Dependency Edges Resolved", color=color2, fontweight="bold")
line2 = ax2.plot(df_dag["Nodes"], df_dag["Edges"], color=color2, linestyle="--", marker="s", linewidth=1.8, label="Dependency Edges")
ax2.tick_params(axis="y", labelcolor=color2)

plt.title("Prerequisite Roadmap Kahn's Topological Sort Performance Scaling", fontweight="bold", pad=12)
plt.tight_layout()
fig.savefig("docs/experiments/figures/prerequisite_dag_benchmark.png")
plt.close(fig)
print("[OK] Saved docs/experiments/figures/prerequisite_dag_benchmark.png")

# ==============================================================================
# 5. SMART CONTRACT GAS CONSUMPTION FIGURE (Item 34)
# ==============================================================================
gas_data = {
    "Contract Deployment": 1059410,
    "issueCredential": 235000,
    "revokeCredential": 53486,
    "setAuthorizedIssuer": 47781,
    "verifyCredential (tx)": 46350,
    "verifyCredential (call)": 0,
    "isHashRegistered": 0
}

fig, ax = plt.subplots(figsize=(9, 5), dpi=300)
ops = list(gas_data.keys())
gas_values = list(gas_data.values())
bar_colors = ["#3B82F6", "#10B981", "#EF4444", "#F59E0B", "#8B5CF6", "#64748B", "#64748B"]

bars = ax.barh(ops, gas_values, color=bar_colors, edgecolor="#1e293b", height=0.6)
for bar in bars:
    width = bar.get_width()
    if width > 0:
        ax.text(width + 25000, bar.get_y() + bar.get_height()/2.0, f"{int(width):,} gas", ha='left', va='center', fontweight='bold', fontsize=10)
    else:
        ax.text(15000, bar.get_y() + bar.get_height()/2.0, "0 gas (Free Call)", ha='left', va='center', fontweight='bold', color="#475569", fontsize=10)

ax.set_xlim(0, 1300000)
ax.set_title("SmartEvolveCredential.sol EVM Gas Consumption by Operation", fontweight="bold", pad=12)
ax.set_xlabel("Gas Units Consumed (EVM Paris Target)", fontweight="bold")
plt.tight_layout()
fig.savefig("docs/experiments/figures/smart_contract_gas_breakdown.png")
plt.close(fig)
print("[OK] Saved docs/experiments/figures/smart_contract_gas_breakdown.png")

print("\n" + "=" * 70)
print("  ALL EXPERIMENTAL SIMULATIONS & BENCHMARKS COMPLETED SUCCESSFULLY")
print("=" * 70)
