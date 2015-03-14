var sidebar = [
	{
		route: "museum",
		icon: "fa fa-institution fa-fw",
		name: "Museum"
	},
	{
		route: "exhibition",
		icon: "fa fa-image fa-fw",
		name: "Exhibition"
	},
	{
		route: "objects",
		icon: "fa fa-qrcode fa-fw",
		name: "Objects"
	},
	{
		route: "articles",
		icon: "fa fa-book fa-fw",
		name: "Articles"
	},
	{
		route: "notifications",
		icon: "fa fa-envelope fa-fw",
		name: "Notifications"
	},
	{
		route: "users",
		icon: "fa fa-users fa-fw",
		name: "Users"
	},
	{
		route: "leaderboard",
		icon: "fa fa-trophy fa-fw",
		name: "Leaderboard"
	},
	{
		route: "administrators",
		icon: "fa fa-cog fa-fw",
		name: "administrators"
	},
	{
		route: "feedback",
		icon: "fa fa-comments fa-fw",
		name: "Feedback"
	},
	{
		route: "database",
		icon: "fa fa-desktop fa-fw",
		name: "Database"
	}];

var source = $("#side_item").html();
var template = Handlebars.compile(source);
var html = template({
		route: "museum",
		icon: "fa fa-institution fa-fw",
		name: "Museum"
	});
$("#side-menu").append(html);