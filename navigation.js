//Navigation About
function renderAbout(index) {
    let pokemonSpecies = pokemons[currentIndex].species;
    let pokemon = pokemons[currentIndex].details;

    let flavorText = renderFlavorText(pokemonSpecies.flavor_text_entries);
    let abilitiesList = renderAbilities(pokemon.abilities);
    let genderDescription = renderGenderRate(pokemonSpecies.gender_rate);
    let eggGroups = renderEggGroups(pokemonSpecies.egg_groups);
    
    let infoContainer = document.getElementById('info-content');
    infoContainer.innerHTML = htmlAboutTemplate(pokemon, pokemonSpecies, abilitiesList, flavorText, eggGroups, genderDescription);
}

function renderFlavorText(flavorTextEntries) {
    let flavorText = 'Beschreibung nicht verfügbar';
    for (let i = 0; i < flavorTextEntries.length; i++) {
        if (flavorTextEntries[i].language.name === 'en') {
            flavorText = flavorTextEntries[i].flavor_text.replace(/[\n\f]/g, ' ').replace(/é/g, 'É'); //Bereinigung von Zeilenumbrüchen für Fließtext und pokemon é wird groß geschrieben 
        }
    }
    return flavorText;
}

function renderAbilities(abilities) {
    let abilitiesHTML = '';
    if(!abilities || abilities.length === 0) {
        abilitiesHTML = 'Für dieses Pokemon sind leider keine Fähigkeiten verfügbar';
    } else {
        for (let i = 0; i < abilities.length; i++) {
            abilitiesHTML += capitalizeFirstLetter(abilities[i].ability.name);
            if (i < abilities.length - 1) {
                abilitiesHTML += ', ';
            }    
        }
    }
    return abilitiesHTML;
}

function renderGenderRate(genderRate) {
    //genderDescriptions ist Array (Objekt), daher keine Forschleife
    return genderDescriptions[genderRate] || "Unbekannte Geschlechterrate";
} 

function renderEggGroups(eggGroups) {
    let eggGroupsHTML = '';
    if (!eggGroups || eggGroups.length === 0) {
        eggGroupsHTML = 'unbekannt';
    } else {
        for (let i = 0; i < eggGroups.length; i++) {
            eggGroupsHTML += capitalizeFirstLetter(eggGroups[i].name);
            if (i < eggGroups.length - 1) {
                eggGroupsHTML += ', ';
            }
        }
    }
    return eggGroupsHTML;
}

function htmlAboutTemplate(pokemon, pokemonSpecies, abilitiesList, flavorText, eggGroups, genderDescription) {
    return `
        <div class="about-container">
        <h2 class="navigationHeadline">About ${pokemon.name}</h2>
        <div class="flavor-text">${flavorText.replace(/é/g, 'É')}</div>
        <table class="heightandweight">
            <tr>
                <td><b>Species</b></td>
                <td>${pokemonSpecies.genera[4].genus}</td>
            </tr>
            <tr>
                <td><b>Abilities</b></td>
                <td>${abilitiesList}</td>
            </tr>  
            <tr>
                <td><b>Height</b></td>
                <td>${pokemon.height / 10} m</td>
            </tr>
            <tr>
                <td><b>Weight</b></td>
                <td>${pokemon.weight / 10} kg</td>
            </tr>
        </table>
        <table class="Breeding">
            <h2>Breeding</h2>
            <tr>
                <td style="padding: 5px 0 10px 20px"><b>Gender</b></td>
                <td style="padding: 5px 0 10px 0">${genderDescription}</td>
            </tr>  
            <tr>
                <td style="padding: 5px 0 10px 20px"><b>Egg Groups</b></td>
                <td style="padding: 5px 0 10px 0">${eggGroups}</td>
            </tr>  
        </table>
    </div>
    `;
}

//Erster Buchstabe im String soll großgeschrieben werden charAt(0)ist die Indexposition des ersten Buchstaben toUpperCase macht Großbuchstaben und das Plus verbindet den Großbuchstaben mit dem Rest des Strings wobei string.slice(1) festlegt, dass der zweite buchstabe nicht mehrh großgeschriben werden soll
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

//Navigation Base Stats
function getStatsData(pokemonDetails) {
    let statsOrder = ['hp', 'attack', 'defense', 'special-attack', 'special-defense', 'speed'];
    let statsData = [];
    let total = 0; // Initialisierung mit 0

    for (let i = 0; i < statsOrder.length; i++) {
        let statName = statsOrder[i]; 
    
        // Finde den Index des statName in der statsOrder Liste
        let index = statsOrder.indexOf(statName);
        // Ternary wenn es einen Wert gibt oder wenn es keinen wert gibt dann wird 0 verwendet
        let stat = pokemonDetails.stats[index] ? pokemonDetails.stats[index].base_stat : 0;
        statsData.push(stat);
        total += stat; // Addiere den Wert direkt zur Gesamtsumme
    }

    statsData.push(total); // Füge die Gesamtsumme am Ende des Arrays hinzu
    return statsData;
}

function setupChart(statsData) {
    let ctx = document.getElementById('myChart');

    Chart.defaults.font.size = 14;
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['HP', 'Attack', 'Defense', 'Sp. Atk', 'Sp. Def', 'Speed', 'Total'],
            datasets: [{
                data: statsData,
                backgroundColor: '#77BDFE',
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        display: false
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            },
            indexAxis: 'y',
            plugins: {
                legend: {
                    display: false
                },
                datalabels: {
                    anchor: 'end',
                    align: 'end',
                }
            },
            barThickness: 15,
        }
    });
}

function renderBaseStats() {
    let pokemonStats = pokemons[currentIndex].details; 
    let statsData = getStatsData(pokemonStats);

    let infoContainer = document.getElementById('info-content');
    infoContainer.innerHTML = '<h2 class="navigationHeadline">Base Stats</h2><canvas class="myChart" id="myChart"></canvas>';

    setupChart(statsData);
}

//Navigation Evolution, Laden & Speichern der gesamten Evolutionskette
async function fetchEvolution() {
    if (pokemons[currentIndex] && pokemons[currentIndex].species) {
        let evolutionUrl = pokemons[currentIndex].species.evolution_chain.url;

        try {
            let response = await fetch(evolutionUrl); 
            let evolutionChain = await response.json();
            // Speichern der Evolutions im Pokémon-Objekt
            pokemons[currentIndex].evolutionChain = evolutionChain;
    
            renderEvolution(evolutionChain);
    
        } catch (error) {
            console.error(`Fehler beim Laden der Evolutions: ${error}`);
        }
    } 
}

async function renderEvolution(evolutionChain) {
    let infoContent = document.getElementById('info-content');
    let htmlContent = '<h2 class="navigationHeadline">Evolution Chain</h2>'; 
    let currentEvolution = evolutionChain.chain;

    while (currentEvolution) {
        let pokemonName = currentEvolution.species.name;  
        let imageUrl = await getImageUrlForPokemon(pokemonName);
        htmlContent += createEvolutionHTML(pokemonName, imageUrl); 
        currentEvolution = getNextEvolution(currentEvolution);
        } 
    infoContent.innerHTML = htmlContent;
}

// nächste Evolution, falls vorhanden
function getNextEvolution(currentEvolution) {
    return currentEvolution.evolves_to && currentEvolution.evolves_to.length > 0 ? currentEvolution.evolves_to[0] : null;
}

// Bild URL für jedes Pokemon
async function getImageUrlForPokemon(pokemonName) {
    //mit find wird das pokemon im Array pokemons gesucht  
    let pokemon = pokemons.find(p => p.name === pokemonName);

    if (pokemon && pokemon.details && pokemon.details.sprites) {
        return pokemon.details.sprites.other?.showdown?.front_shiny || pokemon.details.sprites.front_default;
    }
    return ''; 
}

function createEvolutionHTML(pokemonName, imageUrl) {
    return `
        <div class="evolution-stage">
            <h3>${pokemonName}</h3>
            <img class="evolutionImage" src="${imageUrl}" alt="${pokemonName}"/>
        </div>
    `;
}

function renderMoves(index) {
    let pokemonMoves = pokemons[currentIndex].details.moves;
    let infoContainer = document.getElementById('info-content');

    // Überschrift
    let movesHTML = '<h2 class="navigationHeadline">Top Moves</h2><ul>';

    // es werden nur die Top 10 der Moves hinzugefügt
    for (let i = 0; i < Math.min(10, pokemonMoves.length); i++) {
        let moveName = pokemonMoves[i].move.name;
        movesHTML += `<li>${moveName}</li>`;
    }
    // Schließen der Liste und mit 10 Top Moves
    infoContainer.innerHTML = movesHTML + '</ul>';
}

// Navigationsleiste jeweils hervorheben
function setActiveNavLink() { 
    document.querySelectorAll('.navigation a').forEach(link => {
        link.classList.remove('activeLink'); // entfernt activeLink vom jeweils ausgewählten Link-Element. 
    });
    document.getElementById('navAbout').classList.add('activeLink'); 
}
  
function addEventListeners() {
    // ActiveNavLink-Funktion anbinden
    activeNavLink();
    // Spezifische Event-Listener für die Navigation
    document.getElementById('navAbout').addEventListener('click', renderAbout);
    document.getElementById('navBaseStats').addEventListener('click', renderBaseStats);
    document.getElementById('navEvolution').addEventListener('click', fetchEvolution);
    document.getElementById('navMoves').addEventListener('click', renderMoves);
  }

function activeNavLink() {
    document.querySelectorAll('.navigation a').forEach(link => {
        link.addEventListener('click', function() {
          // Aktualisiere nur, wenn dieser Link nicht bereits aktiv ist
          if (!this.classList.contains('activeLink')) {
            // Entferne 'activeLink' von allen und füge sie zum geklickten hinzu
            document.querySelectorAll('.navigation a').forEach(link => {
              link.classList.remove('activeLink');
            });
            this.classList.add('activeLink');
          }
        });
    });
}

// setActiveNavLink bleibt unverändert
function setActiveNavLink() { 
    document.querySelectorAll('.navigation a').forEach(link => {
        link.classList.remove('activeLink');
    });
    document.getElementById('navAbout').classList.add('activeLink'); 
}