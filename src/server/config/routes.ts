 function initialize() {
    this.root('home#index');

    this.match("index/:user", "home#index");
    this.match("index/:user/:repository", "home#index");
    this.match("index/:user/:repository/:milestone", "home#index");

    this.match("login", "authentication#login");
    this.match("logout", "authentication#logout");
    this.match("auth", "authentication#authenticate");
    this.match("auth/callback", "authentication#callback");

    this.resources("repositories", { only: "index" });
    this.resources("labels", { only: "index" });
    this.resources("milestones", { only: "index" });
    this.resources("collaborators", { only: "index" });
    this.resources("issues", { only: ["index", "update"] });
}

export = initialize;