class PubSub {
    constructor(){
        this.events = {};
    }

    on(evenName, fn){
        this.events[evenName] =  this.events[evenName] || [];
        this.events[evenName].push(fn);
    }

    emit(evenName, params){
        if(this.events[evenName]){
            this.events[evenName].forEach(fn => fn(params))
        }
    }
}

class Model extends PubSub{
    constructor(){
        super();
        if(localStorage.getItem("todoApp")){
            this.todoItems = JSON.parse(localStorage.getItem("todoApp"));
            console.log(this.events);
        }
        else{
            this.todoItems = [];
            console.log("no items");
        }
    }

    getLastTodoItemId(){
        if(this.todoItems.length == 0) return 0;
        else {
            return this.todoItems[this.todoItems.length - 1].id;
        }
    }

    getTodoItem(id){
        return this.todoItems.find(todoItem => todoItem.id == id)
    }

    addTodoItem(todoItem){
        this.todoItems.push(todoItem);
        this.saveToStorage(this.todoItems);
        return todoItem;
    }

    updateTodoItem(id, todoItemdata){
        let todoItem = this.getTodoItem(id);
        Object.keys(todoItemdata).forEach(param => todoItem[param] = todoItemdata[param]);
    }

    deleteTodoItem(id){
        let index = this.todoItems.findIndex(todoItem => todoItem.id == id);
        if (index != -1)
            this.todoItems.slice(index, 1);
    }

    saveToStorage(todoItems){
        localStorage.removeItem("todoApp");
        todoItems = JSON.stringify(todoItems);
        localStorage.setItem("todoApp", todoItems);
    }

    getFromStorage(){        
        return localStorage.getItem("todoApp") ? JSON.parse(localStorage.getItem("todoApp")) : [];
    }

}

class View extends PubSub{
    constructor(){
        super();
        this.input = document.getElementById("todo-input");
        this.button = document.getElementById("todo-add");
        this.button.addEventListener('click', this.addTodoItemHandler.bind(this));
        this.todoList = document.getElementById("todo-list");
        this.todoItemTemplate = 
        `
        <input type="text" class="form-control todo-item-text" value="" readonly>
            <span class="input-group-btn">
                <button class="btn btn-default todo-edit">Edit</button>
                <button class="btn btn-default todo-delete">Delete</button>
            </span>
        `;
    }

    addTodoItemHandler(){
        if(!this.input.value) return alert("Please fill in the field")
        let inputValue = this.input.value;
        this.emit('addToDoItem', inputValue);
    }

    createTodoItem(todoItem){
        let div = document.createElement("div");
        div.id = todoItem.id;
        div.className = "input-group todo-item";
        div.innerHTML = this.todoItemTemplate;

        return div;
    }

    addTodoItem(todoItem){
        let item = this.createTodoItem(todoItem);
        this.todoList.appendChild(item);
        document.getElementById(todoItem.id).querySelector('input').value = todoItem.inputValue;
        document.getElementById(todoItem.id).querySelector('.todo-edit').addEventListener('click', this.editTodoItemHandler.bind(this));
        document.getElementById(todoItem.id).querySelector('.todo-delete').addEventListener('click', this.deleteTodoItemHandler.bind(this));
    }

    editTodoItemHandler({ target}){
        let todoItem = target.parentNode.parentNode;
        let todoItemId = todoItem.getAttribute('id');
        this.emit('editToDoItem', todoItemId);
    }

    deleteTodoItemHandler({ target}){
        let todoItem = target.parentNode.parentNode;
        let todoItemId = todoItem.getAttribute('id');
        this.emit('deleteToDoItem', todoItemId);
    }
}

class Controller {
    constructor(){
        this.view = new View();
        this.model = new Model();
        this.view.on('addToDoItem', this.addToDoItem.bind(this));
        this.view.on('editToDoItem', this.editToDoItem.bind(this));
        this.view.on('deleteToDoItem', this.deleteToDoItem.bind(this));
        this.model.on('init', this.renderView.bind(this));
        if(this.model.todoItems != []){this.model.emit('init', this.model.todoItems);}
    }

    addToDoItem(inputValue){
        let todoItemId = this.model.getLastTodoItemId() + 1;
        let todoItem = this.model.addTodoItem({
            id: todoItemId,
            inputValue,
            completed: false
        });
        this.view.addTodoItem(todoItem);
    }

    editToDoItem(todoItemId){
        console.log(todoItemId);
    }

    deleteToDoItem(todoItemId){
        console.log(todoItemId);
    }

    renderView(todoItems){
        console.log(todoItems);
        for(let i=0; i<todoItems.length; i++){
            this.view.addTodoItem(todoItems[i]);
        }
    }
}

let controller = new Controller();