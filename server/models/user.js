class User {
    constructor(username, password, role) {
        this.username = username;
        this.password = password;
        this.role = role;
    }

    static addUser(user) {
        User.users.push(user);
    }

    static findUser(username) {
        return User.users.find(user => user.username === username);
    }

    static authenticate(username, password) {
        const user = User.findUser(username);
        return user && user.password === password ? user : null;
    }
}

User.users = [
    { username: 'admin', password: 'adminpassword', role: 'admin' },
    { username: 'user', password: 'userpassword', role: 'user' }
];
module.exports = User;
