 function initialize() {
    this.root('home#index');

    this.match("login", "authentication#login");
    this.match("logout", "authentication#logout");
    this.match("auth", "authentication#authenticate");
    this.match("auth/callback", "authentication#callback");

    this.resources("repositories", { only: "index" });
    this.resources("labels", { only: "index" });
    this.resources("milestones", { only: "index" });
}

export = initialize;