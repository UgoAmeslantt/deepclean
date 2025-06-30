// Utilitaire de chargement d'assets pour Deep Clean
import { TrashType } from "./Trash";

export const assetMap: Record<TrashType | "player" | "bg1" | "bg2" | "bg3" | "bg4" | "oxygen", string> = {
  // Déchets
  bottle: "/Images/Dechets/bouteille.png",
  bouteille2: "/Images/Dechets/bouteille-2.png",
  bouteille3: "/Images/Dechets/bouteille-3.png",
  can: "/Images/Dechets/canette.png",
  canette2: "/Images/Dechets/canette-2.png",
  pneus: "/Images/Dechets/pneus.png",
  sacJaune: "/Images/Dechets/sacPoubelle-jaune.png",
  sacVert: "/Images/Dechets/sacPoubelle-vert.png",
  tasseCafe: "/Images/Dechets/tasse-cafe.png",
  tasseCafe2: "/Images/Dechets/tasse-cafe-2.png",
  boutPlastique: "/Images/Dechets/bout-plastique.png",
  boutBouteilleVerre: "/Images/Dechets/bout-Bouteille-verre.png",
  bag: "/Images/Dechets/sacPoubelle-vert.png", // fallback
  water: "/Images/Dechets/bouteille.png", // fallback
  oxygen: "/Images/bouteille-oxygene.png",
  // Animaux marins
  poisson: "/Images/Animaux_marins/poisson.png",
  poissonBleu: "/Images/Animaux_marins/poisson-bleu.png",
  poissonRouge: "/Images/Animaux_marins/poisson-rouge.png",
  poissonLumiere: "/Images/Animaux_marins/poisson-lumiere.png",
  raie: "/Images/Animaux_marins/raie.png",
  tortue: "/Images/Animaux_marins/tortue.png",
  baleine: "/Images/Animaux_marins/baleine.png",
  dauphin: "/Images/Animaux_marins/dauphin.png",
  hypocampe: "/Images/Animaux_marins/hypocampe.png",
  pieuvre: "/Images/Animaux_marins/pieuvre.png",
  // Joueur
  player: "/Images/sous-marin.png",
  // Fonds marins
  bg1: "/Images/Fond_marin/ocean-bg-1.png",
  bg2: "/Images/Fond_marin/ocean-bg-2.png",
  bg3: "/Images/Fond_marin/ocean-bg-3.png",
  bg4: "/Images/Fond_marin/ocean-bg-4.png"
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