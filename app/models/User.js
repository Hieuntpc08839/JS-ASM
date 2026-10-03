class User {
    constructor(name, email, phone, address, role = "member") {
        this.name = name;
        this.email = email;
        this.phone = phone;
        this.address = address;
        this.role = role;
    }
}