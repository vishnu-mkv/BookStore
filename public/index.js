const empty = document.getElementById('empty');

const getAllBooksApi = () => {
    axios.get('http://localhost:3000/records/')
        .then(res => {
            console.log("data", res.data);
            clearTable();
            addBooks(res.data)
        })
        .catch(err => console.log(err));
}

const removeAllBooksApi = () => {
    return new Promise(function (resolve, reject) {
        axios.post('http://localhost:3000/records/reset/', {'yeet': true})
            .then(res => {
                resolve(res);
            })
            .catch(err => reject(err));
    })
}

const addBookApi = (data) => {
    return new Promise(function (resolve, reject) {
        axios.post('http://localhost:3000/records/create/', data)
            .then(res => {
                resolve(res);
            })
            .catch(err => reject(err));
    })
}

const updateBookApi = (data) => {
    return new Promise(function (resolve, reject) {
        axios.post('http://localhost:3000/records/update/', data)
            .then(res => {
                resolve(res);
            })
            .catch(err => reject(err));
    })
}

const removeBookApi = (id) => {
    return new Promise(function (resolve, reject) {
        axios.post('http://localhost:3000/records/remove/', {'id': id})
            .then(res => {
                resolve(res);
            })
            .catch(err => reject(err));
    })
}

const addBooks = function (books) {
    books.forEach(book => addBook(book, msg = false))
}

const addBook = (book, msg = true) => {
    const table = document.getElementById('table');
    const template = `<td class="center row-id">place_id</td>
                <td class="left row-name">place_name</td>
                <td class="center row-author">place_author</td>
                <td class="row-isbn">place_isbn</td>
                <td class="row-avail">place_availability</td>
                <td class="row-price">place_price</td>
                <td class="options">
                    <div class="icon"><p></p><p></p><p></p></div>
                    <div class="dropdown"><p class="edit">Edit</p><p class="delete">Delete</p></div>
                </td>`

    let {id, title, author, price, availability: avail, isbn} = book;

    let childText = template.replace("place_name", title)
        .replace("place_id", id).replace("place_author", author)
        .replace("place_price", price).replace("place_availability", avail)
        .replace("place_isbn", isbn);

    let child = document.createElement('tr');
    child.className = "row";
    child.id = id;
    child.innerHTML = childText;

    if (msg) addMessage(`Book added - ${title}`)

    removeEmptyNote();
    table.appendChild(child);
    child.getElementsByClassName("delete")[0]
        .addEventListener('click', e => removeBook(e));
    child.getElementsByClassName("edit")[0]
        .addEventListener('click', e => editHandler(e));

}

const addEmptyNote = () => {
    let empty = document.getElementById('empty');
    if (empty) return;

    if (document.getElementsByClassName('row').length > 0) return;

    let template = "<p>Nothing here for now...</p>";
    const child = document.createElement('div');
    child.id = "empty";
    child.innerHTML = template;
    document.getElementById('records').appendChild(child);
}

const removeEmptyNote = () => {
    let empty = document.getElementById('empty')
    empty?.remove();
}


const removeBook = (e) => {
    let row = e.target.parentNode.parentNode.parentNode;
    removeBookApi(row.id)
        .then(() => {
            row.remove();
            addEmptyNote();
            addMessage(`Book removed - id: ${row.id}`)
        })
        .catch(e => console.log(e))

}

const removeAllBooks = () => {
    removeAllBooksApi()
        .then(() => {
            clearTable();
            addEmptyNote();
            addMessage("All books removed!")
        })
        .catch(e => console.log(e))
}

const clearTable = () => {
    Array.from(document.getElementsByClassName('row')).forEach(row => row.remove());
}

const exitForm = () => {
    document.getElementById('only-form').style.display = null;
}

const formExitHandler = (e) => {
    if (e.target.id === "only-form") {
        exitForm();
    }
}

const AddFormHandler = () => {
    let formContainer = document.getElementById('only-form');
    formContainer.style.display = "flex";
    let form = document.getElementById('actual-form');
    form.reset();
    form.setAttribute('data-mode', 'add');
    document.getElementById('form-title').innerText = "Add a Book";
}

const editHandler = (e) => {

    let row = e.target.parentNode.parentNode.parentNode;

    let formContainer = document.getElementById('only-form');
    formContainer.style.display = "flex";
    let form = document.getElementById('actual-form');
    form.reset();
    form.setAttribute('data-mode', 'update');
    form.setAttribute('data-id', row.getElementsByClassName('row-id')[0].innerText);
    document.getElementById('form-title').innerText = `Update Book - ${row.getElementsByClassName('row-name')[0].innerText}`;

    document.getElementById('name').value = row.getElementsByClassName('row-name')[0].innerText;
    document.getElementById('author').value = row.getElementsByClassName('row-author')[0].innerText;
    document.getElementById('availability').value = row.getElementsByClassName('row-avail')[0].innerText;
    document.getElementById('isbn').value = row.getElementsByClassName('row-isbn')[0].innerText;
    document.getElementById('price').value = row.getElementsByClassName('row-price')[0].innerText;
}

const formSaveHandler = (e) => {
    e.preventDefault();
    let form = document.getElementById('actual-form');
    let data = {
        'title': document.getElementById('name').value,
        'author': document.getElementById('author').value,
        'availability': parseInt(document.getElementById('availability').value),
        'isbn': document.getElementById('isbn').value,
        'price': parseInt(document.getElementById('price').value),
    };

    for (const [key, value] of Object.entries(data)) {
        if (value === "" || value === null) delete data[key]
    }

    let mode = form.getAttribute('data-mode');

    if (mode === "update") {
        data['id'] = parseInt(form.getAttribute('data-id'));
        updateBookApi(data)
            .then(res => {
                console.log(res);
                getAllBooksApi();
                addMessage(`Book updated - ${res.data[0].title} (id: ${res.data[0].id})`);
            })
            .catch(err => addMessage(`error - ${err}`));
    } else if (mode === "add") {
        addBookApi(data)
            .then(res => {
                addMessage(`Book added - ${res.data[0].title} (id: ${res.data[0].id})`);
                getAllBooksApi();
            })
            .catch(err => addMessage(`error - ${err}`));

    }

    exitForm();
}

const createMessageContext = () => {
    let temp = document.getElementById('messages');
    if (temp) return temp;
    let node = document.createElement('div');
    node.id = 'messages';
    document.body.append(node);
    return node;
}

const deleteMessageContext = () => {
    let msg = document.getElementById(('messages'))
    if (!msg) return;
    if (msg.hasChildNodes()) return;
    msg.remove()
}

const removeMessage = (msgNode) => {
    setTimeout(() => {
        msgNode.remove();
        deleteMessageContext();
    }, 2000);
}

const addMessage = (msg) => {

    let node = document.createElement('small');
    node.innerText = msg;
    let context = createMessageContext();
    context.append(node);
    removeMessage(node);
}

//start
getAllBooksApi();
setInterval(function () {
    getAllBooksApi();
}, 20000);

document.getElementById('full-reset').addEventListener('click', () => removeAllBooks())
document.getElementById('refresh').addEventListener('click', () => {
    getAllBooksApi();
    addMessage("Refreshing...");
})
document.getElementById('create').addEventListener('click', () => AddFormHandler())
document.getElementById('only-form').addEventListener('click', (e) => formExitHandler(e))
document.getElementById('actual-form').addEventListener('submit', (e) => formSaveHandler(e))