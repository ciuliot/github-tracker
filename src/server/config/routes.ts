 function initialize() {
    this.root('home#index');

    this.match("developer_board/:user/:repository/:milestone", "home#index");
    this.match("qa_board/:user/:repository/:milestone", "home#index");

    this.match("login", "authentication#login");
    this.match("logout", "authentication#logout");
    this.match("auth", "authentication#authenticate");
    this.match("auth/callback", "authentication#callback");

    this.resources("user", { only: "index" });
    this.match("user/subscribeForNotifications/:user/:repository", "user#subscribeForNotifications");

    this.resources("repositories", { only: "index" });
    this.resources("labels", { only: "index" });
    this.resources("milestones", { only: "index" });
    this.resources("collaborators", { only: "index" });
    this.resources("issues", { only: ["index", "update", /*"show",*/ "create"] });
    this.resources("impediments", { only: ["update", "index"] });
    this.resources("comments", { only: ["update", "show"] });
}

export = initialize;