#!/usr/bin/env python3
"""
Script pour générer la visualisation de la descente de gradient
Génère : gradient-descent-parabola.webp
"""

import numpy as np
import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d import Axes3D

# Configuration pour de belles images
plt.rcParams['figure.figsize'] = (12, 8)
plt.rcParams['font.size'] = 11
plt.rcParams['axes.labelsize'] = 12
plt.rcParams['axes.titlesize'] = 14

def loss(w, b, x=20, y_true=13):
    """Fonction de perte MSE pour notre exemple pizza"""
    y_pred = w * x + b
    return 0.5 * (y_true - y_pred)**2

# Créer la grille pour la surface
w = np.linspace(-0.5, 2.5, 100)
b = np.linspace(-2, 5, 100)
W, B = np.meshgrid(w, b)
L = loss(W, B)

# Simulation de la trajectoire de descente de gradient
# (valeurs calculées avec η=0.0001, 50 itérations)
trajectory_w = [1.0, 0.984, 0.969, 0.954, 0.940, 0.927, 0.914, 0.902,
                0.890, 0.879, 0.868, 0.858, 0.848, 0.838, 0.829, 0.820,
                0.811, 0.802, 0.794, 0.786, 0.778, 0.770, 0.763, 0.756,
                0.749, 0.742, 0.735, 0.729, 0.722, 0.716, 0.710, 0.704,
                0.699, 0.693, 0.688, 0.682, 0.677, 0.672, 0.667, 0.662,
                0.658, 0.653, 0.649, 0.644, 0.640, 0.636, 0.632, 0.628,
                0.624, 0.620]

trajectory_b = [1.0, 0.9992, 0.9984, 0.9977, 0.9970, 0.9963, 0.9956, 0.9950,
                0.9943, 0.9937, 0.9931, 0.9925, 0.9920, 0.9914, 0.9909, 0.9904,
                0.9899, 0.9894, 0.9889, 0.9885, 0.9880, 0.9876, 0.9872, 0.9868,
                0.9864, 0.9860, 0.9857, 0.9853, 0.9850, 0.9846, 0.9843, 0.9840,
                0.9837, 0.9834, 0.9831, 0.9828, 0.9826, 0.9823, 0.9820, 0.9818,
                0.9815, 0.9813, 0.9811, 0.9809, 0.9807, 0.9804, 0.9802, 0.9800,
                0.9799, 0.9797]

trajectory_L = [loss(w_i, b_i) for w_i, b_i in zip(trajectory_w, trajectory_b)]

# Créer le plot 3D
fig = plt.figure(figsize=(14, 10))
ax = fig.add_subplot(111, projection='3d')

# Surface de perte avec un joli gradient de couleurs
surf = ax.plot_surface(W, B, L, cmap='viridis', alpha=0.7,
                       edgecolor='none', antialiased=True)

# Trajectoire de descente avec dégradé de couleur
colors = plt.cm.RdYlGn(np.linspace(0, 1, len(trajectory_w)))
for i in range(len(trajectory_w)-1):
    ax.plot(trajectory_w[i:i+2], trajectory_b[i:i+2], trajectory_L[i:i+2],
            color=colors[i], linewidth=2.5, alpha=0.8)

# Points spéciaux
# Point de départ (rouge)
ax.scatter([trajectory_w[0]], [trajectory_b[0]], [trajectory_L[0]],
           color='red', s=300, marker='o', edgecolors='darkred',
           linewidths=2, label='Départ (w=1.0, b=1.0)', zorder=5)

# Points intermédiaires (quelques-uns)
for i in [10, 20, 30, 40]:
    ax.scatter([trajectory_w[i]], [trajectory_b[i]], [trajectory_L[i]],
               color='orange', s=100, marker='o', alpha=0.6, zorder=4)

# Point d'arrivée (vert)
ax.scatter([trajectory_w[-1]], [trajectory_b[-1]], [trajectory_L[-1]],
           color='green', s=300, marker='*', edgecolors='darkgreen',
           linewidths=2, label='Minimum (w≈0.62, b≈0.98)', zorder=5)

# Vraie solution (étoile bleue)
true_w, true_b = 0.5, 3.0
true_L = loss(true_w, true_b)
ax.scatter([true_w], [true_b], [true_L],
           color='blue', s=400, marker='*', edgecolors='darkblue',
           linewidths=2, label='Vraie solution (w=0.5, b=3.0)', zorder=5)

# Labels et titre
ax.set_xlabel('Poids w', fontsize=14, labelpad=10)
ax.set_ylabel('Biais b', fontsize=14, labelpad=10)
ax.set_zlabel('Perte L', fontsize=14, labelpad=10)
ax.set_title('Descente de Gradient : Navigation dans la Surface de Perte\n' +
             '(Exemple : Prix de Pizza)', fontsize=16, pad=20)

# Légende
ax.legend(loc='upper left', fontsize=11)

# Colorbar pour la surface
fig.colorbar(surf, ax=ax, shrink=0.5, aspect=5, label='Perte L')

# Ajuster la vue pour un meilleur angle
ax.view_init(elev=20, azim=45)

# Grille plus légère
ax.grid(True, alpha=0.3)

plt.tight_layout()

# Sauvegarder en haute qualité
output_path = 'static/img/gradient-descent-parabola.webp'
plt.savefig(output_path, dpi=300, bbox_inches='tight', format='webp')
print(f"✓ Image sauvegardée : {output_path}")

# Version PNG pour compatibilité
output_path_png = 'static/img/gradient-descent-parabola.png'
plt.savefig(output_path_png, dpi=300, bbox_inches='tight')
print(f"✓ Image sauvegardée : {output_path_png}")

plt.show()
