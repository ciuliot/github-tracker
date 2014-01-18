 function initialize() {
    this.root('home#index');

    this.match("login", "authentication#login");
    this.match("logout", "authentication#logout");
    this.match("auth", "authentication#authenticate");
    this.match("auth/callback", "authentication#callback");
}

export = initialize;