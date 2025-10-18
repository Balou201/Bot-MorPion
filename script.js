// --- VARIABLES GLOBALES DU JEU ---
const HUMAIN = 1; // Joueur 'X'
const IA = 2;     // Joueur 'O'
let plateau = [];
let joueurActuel = 0;
let jeuActif = false;

// --- INITIALISATION DU JEU ---

function creerPlateauHTML() {
    const plateauDiv = document.getElementById('plateau');
    plateauDiv.innerHTML = ''; // Nettoie l'ancien plateau
    
    for (let i = 0; i < 9; i++) {
        const caseDiv = document.createElement('div');
        caseDiv.className = 'case';
        caseDiv.dataset.index = i;
        caseDiv.addEventListener('click', () => faireCoupHumain(i));
        plateauDiv.appendChild(caseDiv);
    }
}

function initialiserJeu(premierJoueur) {
    document.getElementById('choix-depart').style.display = 'none';
    document.getElementById('rejouer').style.display = 'none';
    
    plateau = Array(9).fill(0);
    joueurActuel = premierJoueur;
    jeuActif = true;
    
    creerPlateauHTML();
    
    if (joueurActuel === HUMAIN) {
        afficherMessage("C'est à votre tour (X).");
    } else {
        afficherMessage("L'IA commence (O)...");
        setTimeout(tourIA, 500);
    }
}

function reinitialiserJeu() {
    document.getElementById('choix-depart').style.display = 'block';
    document.getElementById('rejouer').style.display = 'none';
    afficherMessage("Choisissez qui commence pour démarrer le jeu.");
    document.getElementById('plateau').innerHTML = '';
    jeuActif = false;
}

function mettreAJourVisuel(index, joueur) {
    const symbole = joueur === HUMAIN ? 'X' : 'O';
    const caseDiv = document.querySelector(`.case[data-index="${index}"]`);
    if (caseDiv && !caseDiv.dataset.value) {
        caseDiv.innerText = symbole;
        caseDiv.dataset.value = symbole;
    }
}

function afficherMessage(texte) {
    document.getElementById('message').innerText = texte;
}

// --- LOGIQUE DU JEU ---

// Vérifie si un joueur a gagné
function verifierFinJeu(tab) {
    const lignesGagnantes = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // Horizontales
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // Verticales
        [0, 4, 8], [2, 4, 6]             // Diagonales
    ];

    for (const [a, b, c] of lignesGagnantes) {
        if (tab[a] !== 0 && tab[a] === tab[b] && tab[a] === tab[c]) {
            return tab[a]; // Retourne le joueur gagnant (1 ou 2)
        }
    }

    if (!tab.includes(0)) {
        return 0; // Match nul
    }

    return null; // Jeu en cours
}

function faireCoup(index, joueur) {
    if (!jeuActif || plateau[index] !== 0) {
        return false;
    }

    plateau[index] = joueur;
    mettreAJourVisuel(index, joueur);

    const resultat = verifierFinJeu(plateau);
    if (resultat !== null) {
        jeuActif = false;
        document.getElementById('rejouer').style.display = 'block';
        if (resultat === HUMAIN) {
            afficherMessage("Félicitations ! Vous avez gagné !");
        } else if (resultat === IA) {
            afficherMessage("L'IA (O) a gagné. Dommage !");
        } else {
            afficherMessage("Match nul !");
        }
        return true;
    }

    joueurActuel = (joueur === HUMAIN) ? IA : HUMAIN;
    afficherMessage(`C'est au tour de ${joueurActuel === HUMAIN ? 'Vous (X)' : "l'IA (O)"}.`);
    
    return true;
}

function faireCoupHumain(index) {
    if (joueurActuel === HUMAIN) {
        if (faireCoup(index, HUMAIN)) {
            // Si le jeu continue, c'est au tour de l'IA
            if (jeuActif) {
                setTimeout(tourIA, 500); 
            }
        }
    }
}

// --- L'IA IMBATTABLE (ALGORITHME MINIMAX) ---

function tourIA() {
    if (joueurActuel === IA && jeuActif) {
        // L'IA utilise Minimax pour trouver le meilleur coup
        const meilleurCoup = trouverMeilleurCoup(plateau, IA);
        faireCoup(meilleurCoup.index, IA);
    }
}

function trouverMeilleurCoup(nouveauPlateau, joueur) {
    // Les coups possibles sont les index où le plateau est à 0
    const coupsDisponibles = nouveauPlateau
        .map((val, index) => (val === 0 ? index : null))
        .filter(index => index !== null);

    // Vérifie les conditions de fin de jeu
    const resultat = verifierFinJeu(nouveauPlateau);
    if (resultat === IA) {
        return { score: 10 }; // L'IA gagne
    } else if (resultat === HUMAIN) {
        return { score: -10 }; // L'Humain gagne
    } else if (resultat === 0) {
        return { score: 0 }; // Match nul
    }

    const tousLesCoups = [];

    // Boucle sur tous les coups disponibles
    for (let i = 0; i < coupsDisponibles.length; i++) {
        const coup = {};
        coup.index = coupsDisponibles[i];

        // 1. Fais le coup sur le plateau temporaire
        nouveauPlateau[coupsDisponibles[i]] = joueur;

        // 2. Calcule le score avec l'appel récursif (Minimax)
        if (joueur === IA) {
            // L'IA cherche à maximiser son score
            const resultatMinimax = trouverMeilleurCoup(nouveauPlateau, HUMAIN);
            coup.score = resultatMinimax.score;
        } else {
            // L'Humain cherche à minimiser le score de l'IA
            const resultatMinimax = trouverMeilleurCoup(nouveauPlateau, IA);
            coup.score = resultatMinimax.score;
        }

        // 3. Annule le coup pour restaurer le plateau
        nouveauPlateau[coupsDisponibles[i]] = 0;
        
        // Stocke le résultat
        tousLesCoups.push(coup);
    }

    // 4. Choix du meilleur coup
    let meilleurCoup = null;
    if (joueur === IA) {
        // Maximiser (l'IA)
        let meilleurScore = -Infinity;
        for (let i = 0; i < tousLesCoups.length; i++) {
            if (tousLesCoups[i].score > meilleurScore) {
                meilleurScore = tousLesCoups[i].score;
                meilleurCoup = tousLesCoups[i];
            }
        }
    } else {
        // Minimiser (l'Humain)
        let meilleurScore = Infinity;
        for (let i = 0; i < tousLesCoups.length; i++) {
            if (tousLesCoups[i].score < meilleurScore) {
                meilleurScore = tousLesCoups[i].score;
                meilleurCoup = tousLesCoups[i];
            }
        }
    }

    return meilleurCoup;
}

// Génère le plateau vide au chargement
creerPlateauHTML();
</script>
