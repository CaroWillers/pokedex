let pokemons = [];
let currentPage = 0;
let pokemonsPerPage = 20;
let currentIndex;
let likedPokemons = [];

//Farben für die Pokemon Typen
let colors = {
    grass: '#71C558',
    fire: '#EA7A3C ',
    water: '#539AE2',
    electric: '#E5C531',
    ice: '#70CBD4',
    poison: '#B468B7',
    ground: '#CC9F4F',
    rock: '#B2A061',
    bug: '#94BC4A',
    dragon: '#6A7BAF',
    normal: '#AAB09F',
    flying: '#7DA6DE',
    fighting: '#CB5F48',
    psychic: '#E5709B',
    ghost: '#846AB6',
    dark: '#736C75',
    steel: '#89A1B0',
    fairy: '#E397D1',
}; 

//Aufschlüsselung für gender in About Pokemon   
let genderDescriptions = {
    0: "100% Männlich",
    1: "87.5% Männlich, 12.5% Weiblich",
    2: "75% Männlich, 25% Weiblich",
    3: "62.5% Männlich, 37.5% Weiblich",
    4: "50% Männlich, 50% Weiblich",
    5: "37.5% Männlich, 62.5% Weiblich",
    6: "25% Männlich, 75% Weiblich",
    7: "12.5% Männlich, 87.5% Weiblich",
    8: "100% Weiblich", 
    "-1": "Geschlechtslos"
};

function init(){
    loadPokemon();  
    addEventListeners();  
    loadLikes()
    updateLikes();
}

//Laden der Liste mit 40 Pokemon
async function loadPokemon() {

    document.getElementById('loadingIndicator').style.display = 'flex';

    let url = `https://pokeapi.co/api/v2/pokemon?limit=40&offset=0`; //limit=40 begrenzt die Anzahl der pokemon und offset=0 setzt den Startpunkt der Liste

    try { 
        let response = await fetch(url);
        let responseAsJson = await response.json(); 
         //speichert die 40 Pokemon im array pokemons
        pokemons = responseAsJson.results;   
        
        console.log('40 Pokémon sind geladen');

        for (let i = 0; i < pokemons.length; i++) { 
           await loadPokemonDetails(pokemons[i], i);
        }
        renderAllPokemons(); // wird erst aufgerufen, wenn alle details geladen sind
        document.getElementById('loadingIndicator').style.display = 'none';
        } catch (error) {
        console.error('Fehler aufgetreten', error);
        document.getElementById('loadingIndicator').style.display = 'none';
    }
}  

//Laden der Details zu den 40 Pokemon
async function loadPokemonDetails(pokemon, i) { 
    let detailsUrl = `https://pokeapi.co/api/v2/pokemon/${pokemon.name}`; //Detail Informationen für Pokemon Namen

    try { 
        let response = await fetch(detailsUrl);  
        let pokemonDetails = await response.json();
        //speichern der details im array pokemons
        pokemons[i].details = pokemonDetails;
        
        // Zugriff auf die URL der Spezies aus den Detaildaten
        let speciesUrl = pokemonDetails.species.url;
        await loadPokemonSpecies(speciesUrl, i);

        // Speichern der Stats aus den Detaildaten
        pokemons[i].stats = pokemonDetails.stats;
        
        console.log(`${pokemon.name} Details und Spezies geladen`);
        } catch (error) {
        console.error(`Fehler beim Laden der Details oder Spezies von ${pokemon.name}`, error);
    }
}

//Laden der Species zu den 40 Pokemon
async function loadPokemonSpecies(speciesUrl, index) {
    try {
        let response = await fetch(speciesUrl);
        let speciesData = await response.json();
        pokemons[index].species = speciesData;

        let genderRate = speciesData.gender_rate;
        pokemons[index].genderDescription = renderGenderRate(genderRate);

        } catch (error) {
        console.error(`Fehler beim Laden der Species-Daten: ${error}`);
    }
}

function renderAllPokemons() {
    let container = document.getElementById('pokedex');
    if (currentPage === 0) container.innerHTML = ''; // Löscht Inhalte nur beim ersten Aufruf
    document.body.classList.remove('body-no-background');  

    let start = currentPage * pokemonsPerPage;
    let end = Math.min(start + pokemonsPerPage, pokemons.length); 
    
    for (let i = start; i < end; i++) {
        if (i < pokemons.length) { 
            renderPokemon(i);
        }
    }
    document.getElementById('loadMore').style.display = (end < pokemons.length) ? 'block' : 'none';
}

function loadMorePokemons() {  
    document.getElementById('search').value = '';  
    
    let noResultElement = document.getElementById('noResult');
    if (noResultElement) {
        noResultElement.style.display = 'none';
    }
    currentPage++; 
    renderAllPokemons();  
} 

function generateTypesHtml(types) {
    let typesHtml = '';
    for (let i = 0; i < types.length; i++) {
        let type = types[i];
        let typeColor = colors[type.type.name] || '#FFFFFF'; 
        let darkerColor = darkenColor(typeColor, 0.2); //Hintergrundfarbe von types um 20%
        
        typesHtml += `<span class="pokemon-type" style="background-color: ${darkerColor}">${type.type.name}</span>`;
    }
    return typesHtml;
}

function formatPokemonNumber(id) {
    return id.toString().padStart(3, '0');
}

function renderPokemon(index) {
    let pokemon = pokemons[index].details;
    let formattedNumber = formatPokemonNumber(pokemon.id);
    
    let container = document.getElementById('pokedex');
    let pokemonContainer = document.createElement('div'); 
    pokemonContainer.classList.add('pokemon-container'); 

    let backgroundColor = colors[pokemon.types[0].type.name] || '#FFFFFF';
    pokemonContainer.style.backgroundColor = backgroundColor;

    let typesHtml = generateTypesHtml(pokemon.types);
    let pokemonContainerHtml = generatePokemonContainerHtml(pokemon, formattedNumber, typesHtml) ;

    pokemonContainer.innerHTML = pokemonContainerHtml;

    pokemonContainer.addEventListener('click', function() {
        openPokemonCard(index);
    });
    container.appendChild(pokemonContainer);
}

function generatePokemonContainerHtml(pokemon, formattedNumber, typesHtml) {
    return `
        <div class="pokedexName"> 
            <h2 class="h2Pokedex">${pokemon.name}</h2>
            <h3>#${formattedNumber}</h3>
        </div>
        <div class="pokemon-details">
            <div class="pokemon-info">${typesHtml}</div>
            <img class="pokemon-image" src="${pokemon.sprites.other['official-artwork']['front_default']}" alt="${pokemon.name}">
        </div>
`;
}

 // hintergrundfarbe von types
function darkenColor(hex, percent) {
    // Konvertiert Hex zu RGB
    let r = parseInt(hex.substring(1, 3), 16);
    let g = parseInt(hex.substring(3, 5), 16);
    let b = parseInt(hex.substring(5, 7), 16);

    // Berechnet den Abdunkelungseffekt
    r -= Math.round(r * percent);
    g -= Math.round(g * percent);
    b -= Math.round(b * percent);

    // Stellt sicher, dass die Werte nicht unter 0 fallen
    r = Math.max(0, r).toString(16).padStart(2, '0');
    g = Math.max(0, g).toString(16).padStart(2, '0');
    b = Math.max(0, b).toString(16).padStart(2, '0');

    return `#${r}${g}${b}`;
}

function openPokemonCard(index) {
    let pokemon = pokemons[index].details; 
    currentIndex = index;

    updatePokemonHeader(pokemon);

    document.getElementById('pokemon-card').classList.remove('d-none');
    document.getElementById('dialog').classList.remove('d-none'); 
    document.getElementById('pokedex').classList.add('d-none');
    document.getElementById('loadMore').style.display= 'none';
    document.body.classList.add('body-no-background'); 

    document.getElementById('pokemon-card').removeAttribute('onclick');

    renderAbout();
    setActiveNavLink();
}

function updatePokemonHeader(pokemon) {
    let headerContainer = document.getElementById('pokemon-header');
    let primaryType = pokemon.types[0].type.name; // es gibt meistens mehrere Typen
    let backgroundColor = colors[primaryType] || '#FFFFFF'; // Wähle die Farbe basierend auf dem Typ

    // Setze die Hintergrundfarbe für den headerContainer
    headerContainer.style.backgroundColor = backgroundColor;

    let formattedNumber = formatPokemonNumber(pokemon.id);
    let likeImage = likedPokemons.includes(pokemon.id) ? "./img/like.png" : "./img/nolike.png";
    let typesHtml = generateTypesHtml(pokemon.types);

    headerContainer.innerHTML = pokemonHeaderTemplate(pokemon, primaryType, formattedNumber, likeImage, typesHtml);
}

function pokemonHeaderTemplate(pokemon, primaryType, formattedNumber, likeImage, typesHtml ) {
    return `
        <div class="pokemonCardHeader">
            <div class="headerButtons">  
                <button id="closeButton" class="closePokemonCardButton" onclick="closePokemonCard()">X</button>
                <button class="likeContainer" id="toggleLike${pokemon.id}" onclick="toggleLike(${pokemon.id})" style="border: none; background: none; padding: 0;">
                    <img id="likeImage${pokemon.id}" class="likeIcon" src="${likeImage}" alt="Like Button"> 
                </button>
            </div>
            <div class="NameAndNumber">
                <h1 class="h1pokemonCard">${pokemon.name}</h1>
                <h3 class="h3pokemonCard">#${formattedNumber}</h3>
            </div>
            <div class="pokemonCardTypes">${typesHtml}</div>
            <img class="imagePokemonCard" src="${pokemon.sprites.other['official-artwork']['front_default']}">
        </div>
    `;
}

//Schließen der Pokemon Karte
function closePokemonCard() {
    document.getElementById('pokemon-card').classList.add('d-none'); 
    document.getElementById('dialog').classList.add('d-none'); 
    document.getElementById('pokedex').classList.remove('d-none'); 
    document.body.classList.remove('body-no-background'); 
    document.getElementById('search').value = '';

    document.getElementById('pokemon-card').setAttribute('onclick', 'closePokemonCard()');
    renderAllPokemons();
}

//Like Funktion für Pokemon Karte
function toggleLike(id) {
    const index = likedPokemons.indexOf(id);
    if (index > -1) {
        likedPokemons.splice(index, 1); 
    } else {
        likedPokemons.push(id);  
    }
    saveLikes();  
    updateLikes(); 
}

function saveLikes() { 
    localStorage.setItem('likedPokemons', JSON.stringify(likedPokemons));
}
 
function updateLikes() {
    // Gehe durch jedes Like-Icon im Dokument
    document.querySelectorAll('.likeIcon').forEach(icon => {
        // Bestimmt Pokémon-ID basierend auf der ID des Icons
        let pokemonId = parseInt(icon.id.replace('likeImage', ''));

        // Ternary Abfrage für like und nolike Bildwechsel
        icon.src = likedPokemons.includes(pokemonId) ? "./img/like.png" : "./img/nolike.png";
    });
}

function loadLikes() {
    let savedLikes = localStorage.getItem('likedPokemons');
        if (savedLikes) {
        likedPokemons = JSON.parse(savedLikes);
    }
}

//Previous and Next Buttons auf Pokemon Karte
function previousPokemonCard() {
    if (currentIndex > 0) {
        currentIndex--;
        openPokemonCard(currentIndex);
      } else {
        alert('Kein vorheriges Bild vorhanden');
      }
      }
function nextPokemonCard() {
    if (currentIndex < 40) {
        currentIndex++;
        openPokemonCard(currentIndex);
      } else {
        alert('Kein nächstes Bild vorhanden');
    }
} 

// Suchfunktion
function searchPokemon() {
    let search = document.getElementById('search').value.toLowerCase();
    let searchResultContainer = document.getElementById('pokedex');
    searchResultContainer.innerHTML = '';

    let searchResults = false;

    for (let i= 0; i < pokemons.length; i++) {
        let pokemon = pokemons[i];
        if (pokemon.details.name.toLowerCase().includes(search)) {
        renderPokemon(i); 
        searchResults = true; 
        }
      }
      if (!searchResults && search.trim() !== '') {
        searchResultContainer.innerHTML = '<span id="noResult">Deine Suche hat leider kein Ergebnis</span>'        
    }
}
