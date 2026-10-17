export default class User {
    constructor(name, email, phone, address = "", role = "member", gametag = "", password = "") {
        this.name = name;
        this.email = email;
        this.phone = phone;
        this.address = address;
        this.role = role;
        this.gametag = gametag;
        this.password = password;
    }
}