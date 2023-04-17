const CLIENT_ID = "aa6cb608189f41e996155a3f1e0af9c2"
const CLIENT_SECRET = "d7259939446c4e1aaf9d882d60c14e43"

fetch(`https://accounts.spotify.com/api/token`, {
    headers: {
        'Content-Type': "application/x-www-form-urlencoded",
        'Authorization' : 'Basic ' + btoa(CLIENT_ID + ":" + CLIENT_SECRET)
    },
    method: "POST",
    body: "grant_type=client_credentials"
}).then(res => res.json())
.then(data => {
    TOKEN = data.access_token
    fetch(endpoint, {

        headers: {
            'Authorization': 'Bearer ' + TOKEN
        }

    }).then(res => res.json())
    .then(data => {

        allTracks = data.items;

    
        data.items.forEach(item => {
    
            suggestions.push(item.track.name)

        });


    }).catch(error => {
        console.error(error)
    })

})

const PLAYLIST = "4UBZcEEtMr8c93FjmTl9KL"
const ARTIST = "3JDIAtVrJdQ7GFOX26LYpv"

const endpoint = `https://api.spotify.com/v1/playlists/${PLAYLIST}/tracks`
const datalist = document.getElementById("songs")
const inputField = document.getElementById("song_input")
const suggestions = []
const selected = []
const selectedTrack = []
let selectedGenre = null;
let allTracks = []

const wrapper = document.getElementById('select-wrapper')

function select(){
    let insideHTML = "";
    
    for (const select of selected){

        insideHTML += `
        <div class="song-choose-wrap">
            <div class="songs-name">${select}</div>
            <div class="close-icon" data-id="${select}" ><img loading="lazy" src="images/close-icon.svg" alt=""></div>
        </div>`
    }

    wrapper.innerHTML = insideHTML

    for (const element of document.getElementsByClassName('close-icon')){
        element.addEventListener("click", event => { 
            let index = selected.indexOf(event.currentTarget.getAttribute('data-id'))
            suggestions.push(event.currentTarget.getAttribute('data-id'))
            selected.splice(index, 1)
            select()
        })
    }
}

function suggest(index){
    document.getElementById('suggest').innerHTML = ""
    selected.push(suggestions[index])
    selectedTrack.push(allTracks[index])
    suggestions.splice(index, 1)
    inputField.value = ''
    select()
}


inputField.addEventListener("input", (event) => {

    if (selected.length > 2 || event.target.value.length < 2){
        document.getElementById('suggest').innerHTML = ""
        return;
    }

    document.getElementById('suggest').innerHTML = ""

    suggestions.forEach((item, index) => {
        // console.log(item)
        if (item.toLowerCase().includes(event.target.value.toLowerCase())){
            document.getElementById('suggest').innerHTML += `
            <div class="suggestions input-field w-input" style="color: white; margin-top: -5px; height: 60%;text-align: center;cursor: pointer"
            onclick="suggest(${index})">
            ${item}
          </div>`
        }
    })
    
    const matchingSuggestion = suggestions.find(
      (suggestion) => suggestion.toLowerCase() === event.target.value.toLowerCase()
    ) ;

    if (matchingSuggestion && !selected.find(item => item == event.target.value)) {
      selected.push(matchingSuggestion);
      inputField.value = "";
      select()

    }
});


const genres = document.querySelectorAll('[name="Music-choise"]')

for (const genre of genres){

    genre.addEventListener("click", ev => {
        selectedGenre = genre
        let step2 = document.querySelector('.step-2')
        step2.style = "display:block;"
        window.scrollTo({
            top: 1000,
            behavior: 'smooth'
        })
    })
}

function formSubmit(event){
    event.preventDefault()
    
    if (selected.length > 2 && selectedGenre){
        
        let playlist = selectedGenre.getAttribute('data-id')

        fetch('/success-page.html').then(res => res.text()).then(data => {
            document.body.innerHTML = data

            fetch(`https://api.spotify.com/v1/playlists/${playlist}/tracks`,{
                headers: {
                    'Authorization': 'Bearer ' + TOKEN
                }
            })
            .then(res => res.json())
            .then(data => {
                const songs = document.getElementById("songs")
                document.getElementById("heading").innerHTML = selectedGenre.value
                let tracks = data.items.sort(() => 0.5 - Math.random()).slice(0, 10);

                let names = tracks.map(element => element.track.name)
                
                selected.forEach((value, index) => {

                    if (names.indexOf(value) == -1){
                        tracks.push(selectedTrack[index])
                    }
                })

                

                document.getElementById('save-spotify').addEventListener('click', () => {

                     localStorage.setItem('tracks', JSON.stringify(tracks))
                    var redirect_uri = "https://acceptteutonicmixtape.com/"
                    var scope = "playlist-modify-public,user-read-private,user-read-email";
                    window.location.href = `https://accounts.spotify.com/authorize?client_id=${CLIENT_ID}&response_type=token&redirect_uri=${redirect_uri}&scope=${scope}`

                
                    
                })
      
                for (const track of tracks){
                    songs.innerHTML += `
                    <div class="song-item">
                        <div class="paragraph">${track.track.name}</div>
                        <div class="paragraph">${selectedGenre.value.toUpperCase()}</div>
                    </div>
                    `
                }

             })
        })


    }else {
        document.getElementById('message').style = "display:block;"
    }
}


window.onload = event => {

    try {
        let token = window.location.toString().split('#')[1].split('&')[0].split("=")[1];

        if (token && localStorage.getItem('tracks')){
            let tracks = JSON.parse(localStorage.getItem('tracks'))

            

                fetch(`https://api.spotify.com/v1/me/playlists`, {
                    method: "POST", 
                    headers: {
                        'Authorization': 'Bearer ' + token,
                        'Content-Type' : 'application/json'
                    },
                    body: JSON.stringify({
                        name: "Accept " + parseInt(Math.random() * 1000)
                    })
                    
                }).then(res => res.json()).then(data => {
                    console.log(tracks)
                    let name = data.external_urls.spotify
                    let finalUri = []
                    let trackUris = tracks.map(track => track.track.uri)

                    for (const uri of trackUris){
                        finalUri.push(uri)
                    }

                    console.log(finalUri)
                    fetch(data.tracks.href , {
                        headers: {
                            'Authorization': 'Bearer ' + token,
                            'Content-Type' : 'application/json'
                        },
                        method: "POST",
                        body: JSON.stringify({
                            uris : finalUri
                        })
                    }).then(res => res.json())
                    .then(data => {
                        localStorage.removeItem('tracks')
                        window.location.href = name
                    })
                })
            
        }

    } catch(err){
       
    }
}