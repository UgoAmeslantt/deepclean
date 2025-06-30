// Utilitaire de chargement d'assets pour Deep Clean
import { TrashType } from "./Trash";

export const assetMap: Record<TrashType | "player", string> = {
  // Déchets
  bottle: "/Images/Déchets/bouteille.png",
  bouteille2: "/Images/Déchets/bouteille-2.png",
  bouteille3: "/Images/Déchets/bouteille-3.png",
  can: "/Images/Déchets/canette.png",
  canette2: "/Images/Déchets/canette-2.png",
  pneus: "/Images/Déchets/pneus.png",
  sacJaune: "/Images/Déchets/sacPoubelle-jaune.png",
  sacVert: "/Images/Déchets/sacPoubelle-vert.png",
  tasseCafe: "/Images/Déchets/tasse-cafe.png",
  tasseCafe2: "/Images/Déchets/tasse-cafe-2.png",
  boutPlastique: "/Images/Déchets/bout-plastique.png",
  boutBouteilleVerre: "/Images/Déchets/bout-Bouteille-verre.png",
  bag: "/Images/Déchets/sacPoubelle-vert.png", // fallback
  water: "/Images/Déchets/bouteille.png", // fallback
  // Animaux marins
  poisson: "/Images/Animaux marins/poisson.png",
  poissonBleu: "/Images/Animaux marins/poisson-bleu.png",
  poissonRouge: "/Images/Animaux marins/poisson-rouge.png",
  poissonLumiere: "/Images/Animaux marins/poisson-lumière.png",
  raie: "/Images/Animaux marins/raie.png",
  tortue: "/Images/Animaux marins/tortue.png",
  baleine: "/Images/Animaux marins/baleine.png",
  dauphin: "/Images/Animaux marins/dauphin.png",
  hypocampe: "/Images/Animaux marins/hypocampe.png",
  pieuvre: "/Images/Animaux marins/pieuvre.png",
  // Joueur
  player: "/Images/sous-marin.png"
};

export function loadAllAssets(): Promise<Record<string, HTMLImageElement>> {
  const entries = Object.entries(assetMap);
  return Promise.all(
    entries.map(([key, src]) =>
      new Promise<[string, HTMLImageElement]>((resolve, reject) => {
        const img = new window.Image();
        img.src = src;
        img.onload = () => resolve([key, img]);
        img.onerror = () => reject(new Error("Erreur chargement image: " + src));
      })
    )
  ).then((results) => Object.fromEntries(results));
} 