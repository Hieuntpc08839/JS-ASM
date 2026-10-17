// app/models/Category.js
export default class Category {
    constructor(id = null, name = "", parentId = null) {
        this.id = id;
        this.name = name;
        this.parent_id = parentId;
    }
}