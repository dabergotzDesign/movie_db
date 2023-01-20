let databox,db;

//Initiate & open database
function initiate() {
    console.info("initiate");
    databox = document.getElementById("databox");
    const button = document.getElementById("save");
    button.addEventListener("click", addObject);

    const findBtn = document.getElementById("find");
    findBtn.addEventListener("click", findObjects);

    const request = indexedDB.open("movieDatabase");
    request.addEventListener("error", showError);
    request.addEventListener("success", start);
    request.addEventListener("upgradeneeded", createdb);
}

//error handle
function showError(ev) {
    console.info("showerror");
    console.error("Error: " + ev.code + " " + ev.message);
}

//references to database
function start(ev) {
    //console.info("success");
    db = ev.target.result;
}


//generate randonm id
const generator = document.getElementById("generator");    
generator.addEventListener("click", ()=>{
    document.getElementById("key").value = Math.floor(Math.random() * Math.floor(Math.random() * Date.now()));
});

//on success object store & indexes are created
function createdb(ev) {
    console.info("create database");
    const database = ev.target.result;
    const m_store = database.createObjectStore("movies", { keyPath: "id" });

    m_store.createIndex("SearchYear", "date", {unique: false});
}

//add object
function addObject(ev) {
    console.info("add Object");
    const keyID = document.getElementById("key").value;
    const title = document.getElementById("title").value;
    const release = document.getElementById("release").value;

    //console.log(keyID, title, release);

    const m_transaction  = db.transaction(["movies"], "readwrite");
    const m_store = m_transaction.objectStore("movies");
    m_transaction.addEventListener("complete", show);

    const request = m_store.add({ id: keyID, title: title, release: release });
    
    
    //reset values in input
    document.getElementById("key").value = '';
    document.getElementById("title").value = '';
    document.getElementById("release").value = '';
}

//reading new object
function show() {
    console.info("show");
    databox.innerHTML = "";

    const m_transaction  = db.transaction(["movies"]);
    const m_store = m_transaction.objectStore("movies");
    //const newCursor = m_store.openCursor();

    const m_index = m_store.index("SearchYear");
    const newCursor = m_index.openCursor(null, 'prev');

    newCursor.addEventListener("success", showList);
}

function findObjects() {
    databox.innerHTML = "";
    const find = document.getElementById("searchfield").value;

    const m_transaction = db.transaction(["movies"]);
    const m_store = m_transaction.objectStore("movies");
    const m_index = m_store.index("SearchYear");
    const m_range = IDBKeyRange.only(find);
    const newCursor = m_index.openCursor(m_range);
    newCursor.addEventListener("success", showList);

    document.getElementById("searchfield").value = "";
}

function showList(ev) {
    console.info("show List");
    const cursor  = ev.target.result;
    if (cursor) {
        databox.innerHTML += `<div class="item" id="${cursor.value.id}">
        <input type="button" class="remove" onclick="removeObject('${ cursor.value.id }')" value="&times;">
            <div>${cursor.value.title}</div>
            <div> - </div>
            <div>${cursor.value.release}</div>
        </div>`;
        cursor.continue();
    }
}

function removeObject(keyID) {
    if(confirm("remove movie?")){
        var m_transaction = db.transaction(["movies"], 'readwrite');
        var m_store = m_transaction.objectStore("movies");
        m_transaction.addEventListener("complete", show);
        var request  = m_store.delete(keyID);
    }
}

window.addEventListener("load", initiate);