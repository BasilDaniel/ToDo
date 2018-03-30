class Model {
    constructor(){
        this.todoItems = localStorage.getItem("todoApp") ? JSON.parse(localStorage.getItem("todoApp")) : [];
    }

    getTodoItem(id){
        return this.todoItems.find(todoItem => todoItem.id == id)
    }

    addTodoItem(todoItem){
        this.todoItems.push(todoItem);
        this.saveToStorage(this.todoItems);
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
        if(!this.input.value) return alert("Please fill in the form")
        let inputValue = this.input.value;
        this.emit('addToDoItem',value);
    }

    createTodoItem(todoItem){
        let div = document.createElement("div");
        div.id = todoItem.id;
        div.className = "input-group todo-item";
        div.innerHTML = this.todoItemTemplate;

        return div;
    }

    addTodoItem(){
        item = this.createTodoItem(todoItem);
        this.todoList.appendChild(item);
        document.getElementById(todoItem.id).querySelector('input').value = todoItem.value;
        document.getElementById(todoItem.id).querySelector('.todo-edit').addEventListener('click', this.editTodoItem.bind(this));
        document.getElementById(todoItem.id).querySelector('.todo-delete').addEventListener('click', this.deleteTodoItem.bind(this));

    }

    editTodoItem(){

    }

    deleteTodoItem(){

    }
}

class Controller {
    constructor(){
        this.view = new View();
        this.model = new Model();
    }
}

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

let controller = new Controller();