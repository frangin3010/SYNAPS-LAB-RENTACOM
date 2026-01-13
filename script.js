document.addEventListener('DOMContentLoaded', () => {

    // --- SÉLECTION DES ÉLÉMENTS DU DOM ---
    const coutCampagneInput = document.getElementById('cout-campagne');
    const produitsContainer = document.getElementById('produits-container');
    const seuilTotalVentesSpan = document.getElementById('seuil-total-ventes');
    const repartitionVentesUl = document.getElementById('repartition-ventes');
    const calculateBtn = document.getElementById('calculate-btn');
    const addProductBtn = document.getElementById('add-product-btn');

    // --- LE MOTEUR DE CALCUL (Logique pure) ---
    function calculerRentabilite(data) {
        const { coutCampagne, produits } = data;
        if (coutCampagne <= 0 || produits.length === 0) return null;

        let margeTotalePonderee = 0;
        let totalMix = 0;
        produits.forEach(p => {
            const margeUnitaire = p.prixVente - p.coutRevient;
            margeTotalePonderee += margeUnitaire * p.mixVentes;
            totalMix += p.mixVentes;
        });

        if (totalMix === 0) return null;
        const margeMoyennePonderee = margeTotalePonderee / totalMix;

        if (margeMoyennePonderee <= 0) return { seuilTotal: Infinity, repartition: [] };
        const seuilTotal = coutCampagne / margeMoyennePonderee;

        const repartition = produits.map(p => ({
            nom: p.nom,
            quantite: Math.round(seuilTotal * (p.mixVentes / totalMix))
        }));

        return {
            seuilTotal: Math.ceil(seuilTotal),
            repartition: repartition
        };
    }

    // --- GESTION DE L'INTERFACE (UI) ---
    function mettreAJourCalculs() {
        const coutCampagne = parseFloat(coutCampagneInput.value) || 0;
        const produitItems = document.querySelectorAll('.produit-item');
        
        const produits = [];
        produitItems.forEach(item => {
            const nom = item.querySelector('.nom-produit').value || "Produit non nommé";
            const prixVente = parseFloat(item.querySelector('.prix-vente').value) || 0;
            const coutRevient = parseFloat(item.querySelector('.cout-revient').value) || 0;
            const mixVentes = parseFloat(item.querySelector('.mix-ventes').value) || 0;

            if (prixVente > 0) {
                 produits.push({ nom, prixVente, coutRevient, mixVentes });
            }
        });
        
        const data = { coutCampagne, produits };
        const resultat = calculerRentabilite(data);

        if (resultat) {
            if (resultat.seuilTotal === Infinity) {
                seuilTotalVentesSpan.textContent = "∞";
                repartitionVentesUl.innerHTML = "<li>Vos coûts sont supérieurs à vos prix de vente. Rentabilité impossible.</li>";
            } else {
                seuilTotalVentesSpan.textContent = resultat.seuilTotal;
                repartitionVentesUl.innerHTML = resultat.repartition
                    .map(p => `<li><strong>${p.quantite}</strong> x ${p.nom}</li>`)
                    .join('');
            }
        } else {
            seuilTotalVentesSpan.textContent = "0";
            repartitionVentesUl.innerHTML = "";
        }
    }

    function ajouterLigneProduit() {
        const newProductLine = document.createElement('div');
        newProductLine.classList.add('produit-item');
        newProductLine.innerHTML = `
            <input type="text" class="nom-produit" placeholder="Nom du produit">
            <input type="number" class="prix-vente" placeholder="Prix de vente">
            <input type="number" class="cout-revient" placeholder="Coût de revient">
            <input type="number" class="mix-ventes" placeholder="Ventes sur 10">
            <button class="delete-btn">X</button>
        `;
        produitsContainer.appendChild(newProductLine);
    }

    function supprimerLigneProduit(event) {
        if (event.target.classList.contains('delete-btn')) {
            const produitItems = document.querySelectorAll('.produit-item');
            if (produitItems.length > 1) { // Empêche de supprimer la dernière ligne
                event.target.parentElement.remove();
            }
        }
    }

    // --- ÉCOUTEURS D'ÉVÉNEMENTS ---
    calculateBtn.addEventListener('click', mettreAJourCalculs);
    addProductBtn.addEventListener('click', ajouterLigneProduit);
    produitsContainer.addEventListener('click', supprimerLigneProduit);
});
