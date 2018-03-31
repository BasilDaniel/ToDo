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
        }
        else{
            this.todoItems = [];
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

    updateTodoItem(todoItemData){
        let todoItem = this.getTodoItem(todoItemData.id);
        Object.keys(todoItemData).forEach(param => todoItem[param] = todoItemData[param]);
        this.saveToStorage(this.todoItems);
    }

    deleteTodoItem(id){
        let index = this.todoItems.findIndex(todoItem => todoItem.id == id);
        if (index > -1) {
            this.todoItems.splice(index, 1);
        }
        this.saveToStorage(this.todoItems);
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
        this.addButton = document.getElementById("todo-add");
        this.sortButton = document.getElementById("todo-sort");
        this.addButton.addEventListener('click', this.addTodoItemHandler.bind(this));
        this.sortButton.addEventListener('click', this.sortTodoItemHandler.bind(this));
        this.input.addEventListener('keyup', this.addTodoItemHandler.bind(this));

        this.todoList = document.getElementById("todo-list");
        this.sortTodoList = false;
        this.todoItemTemplate = 
        `
        <input type="text" class="form-control todo-item-text" readonly>
        <span class="input-group-btn">        
            <button class="btn btn-default todo-checkbox button">Active</button>
            <button class="btn btn-default todo-edit button">Edit</button>
            <button class="btn btn-default todo-delete button">Delete</button>
        </span>
        `;
    }

    renderView(todoItems){
        this.todoList.innerHTML = "";
        for(let i=0; i<todoItems.length; i++){
            this.addTodoItem(todoItems[i]);
        }
    }

    addTodoItemHandler(e){
        event.preventDefault();
        if(e.keyCode === 13 || e.keyCode == undefined){
            if(!this.input.value) return alert("Please fill in the field")
            let inputValue = this.input.value;
            this.input.value = "";
            this.emit('addToDoItem', inputValue);
        }
    }

    sortTodoItemHandler(){        
        this.emit('sortToDoItem', this.sortTodoList);
    }

    createTodoItem(todoItem){
        let div = document.createElement("div");
        div.id = todoItem.id;
        div.className = "input-group todo-item col-lg-12 col-sm-11 col-xs-9";
        div.innerHTML = this.todoItemTemplate;

        return div;
    }

    addTodoItem(todoItem){
        let item = this.createTodoItem(todoItem);
        this.todoList.appendChild(item);
        let listItem = document.getElementById(todoItem.id);
        let input = listItem.querySelector('input');
        input.value = todoItem.inputValue;        
        if(todoItem.completed){
            listItem.querySelector('.todo-checkbox').innerHTML = "Done";
            input.classList.add("done");
        }
        else{
            listItem.querySelector('.todo-checkbox').innerHTML = "Active";
            input.classList.remove("done");
        }
        listItem.querySelector('.todo-edit').addEventListener('click', this.editTodoItemHandler.bind(this));
        listItem.querySelector('.todo-delete').addEventListener('click', this.deleteTodoItemHandler.bind(this));
        listItem.querySelector('.todo-checkbox').addEventListener('click', this.checkboxTodoItemHandler.bind(this));
        input.addEventListener('keyup', ( function(e){
            if(e.keyCode === 13){
                this.editTodoItemHandler(e);
            }
        }).bind(this));
    }

    checkboxTodoItemHandler({ target }){
        let button = target;
        let todoItem = target.parentNode.parentNode;
        let editingTodoItem = todoItem.querySelector('input');
        let todoItemId = todoItem.getAttribute('id');
        if (button.innerHTML == "Active"){
            button.innerHTML = "Done";
            let todoItemData = {
                id: todoItemId,
                inputValue: editingTodoItem.value,
                completed: true
                };
            this.emit('checkboxTodoItem', todoItemData);          
        }
        else{
            button.innerHTML = "Active";
            let todoItemData = {
                id: todoItemId,
                inputValue: editingTodoItem.value,
                completed: false
            };
            this.emit('checkboxTodoItem', todoItemData);
        }
    }

    editTodoItemHandler({ target}){
        let editingTodoItem;
        let button;
        let todoItem;
        if (target.localName === "button"){
            button = target;
            todoItem = target.parentNode.parentNode;
            editingTodoItem = todoItem.querySelector('input');
        }
        else{
            button = target.parentNode.querySelector('.todo-edit');
            todoItem = target.parentNode;
            editingTodoItem = target;
        }
        if (button.innerHTML == "Edit"){
            button.innerHTML = "Save"            
            editingTodoItem.readOnly = false;
        }
        else{
            button.innerHTML = "Edit"
            editingTodoItem.readOnly = true;
            let todoItemId = todoItem.getAttribute('id');
            let todoItemData = {
            id: todoItemId,
            inputValue: editingTodoItem.value,
            completed: false
            };
            this.emit('editToDoItem', todoItemData);
        }
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
        this.view.on('checkboxTodoItem', this.checkboxTodoItem.bind(this));
        this.view.on('sortToDoItem', this.sortToDoItem.bind(this));
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

    sortToDoItem(sortTodoList){
        let todoItems = this.model.todoItems;
        if (sortTodoList){
            todoItems.sort(function (a, b) {
                if (a.inputValue > b.inputValue) return -1;
                if (a.inputValue < b.inputValue) return 1;

                return 0;
              }); 
            this.view.sortTodoList = false;
        }
        else{
            todoItems.sort(function (a, b) {
                if (a.inputValue > b.inputValue) return 1;
                if (a.inputValue < b.inputValue) return -1;
                
                return 0;
              });
            this.view.sortTodoList = true;
        }
        this.renderView(todoItems);
    }

    checkboxTodoItem(todoItemData){
        this.model.updateTodoItem(todoItemData);
        this.renderView(this.model.todoItems);
    }

    editToDoItem(todoItemData){
        this.model.updateTodoItem(todoItemData);
        this.renderView(this.model.todoItems);
    }

    deleteToDoItem(todoItemId){
        this.model.deleteTodoItem(todoItemId);
        this.renderView(this.model.todoItems);
    }

    renderView(todoItems){
        this.view.renderView(todoItems);
    }
}

let controller = new Controller();