class Model {
    constructor(todoItems = []){
        this.todoItems = todoItems;
    }

    getTodoItem(id){
        return this.todoItems.find(todoItem => todoItem.id == id)
    }

    addTodoItem(todoItem){
        this.todos.push(todoItem);
    }

    updateTodoItem(id, data){
        let todoItem = this.getTodoItem(id);
        Object.keys(data).forEach(param => todoItem[param] = data[param]);
    }

    deleteTodoItem(id){
        let index = this.todoItems.findIndex(todoItem => todoItem.id == id);
        if (index != -1)
            this.todoItems.slice(index, 1);
    }

}

class View {
    constructor(){
        
    }
}

class Controller {
    constructor(){
        
    }
}
