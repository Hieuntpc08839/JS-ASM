// app/models/User.js
export default class User {
    constructor(name, email, phone = "", address = "", role = "member") {
        this.id = null;
        this.gametag = "";
        this.name = name;
        this.email = email;
        this.phone = phone;
        this.address = address;
        this.role = role;
        this.password = "";
    }
}