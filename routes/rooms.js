var db = require("./db");
var koa = require("koa");
var handlebars = require("koa-handlebars");
var parse = require("co-body");
var parse_multi = require("koa-better-body");
var fs = require("fs");

/**
 * Renders the Rooms page
 */
exports.rooms = function(){
    function *rooms(){
        yield this.render("rooms",{
            title: "Rooms",
            rooms : db.rooms
        });
    }
    return rooms;
};

/**
 * Renders the Single Room page.
 * If there is no room with the id passed, render 404;
 */
exports.room = function(){
    function *room(){
        var room;
        var set = false;
        for(var i = 0; i < db.rooms.length; i++){
            if(this.params.id == db.rooms[i].id){
                room = db.rooms[i];
                set = true;
                break;
            }
        }
        if(!set){
            this.status = 404;
            yield this.render("404", {
                title: "Wrong Room"
            });
        }
        else{
            yield this.render("room", {
                title: "Room " + room.number,
                id: room.id,
                ibeacon_list: room.current_id
            });
        }
    }
    return room;
};

/**
 * Add a new room.
 */
exports.new_room = function(){
    function *new_room(){
        db.rooms.push({
            id: db.rooms.length + 1,
            number: db.rooms.length + 1,
            current_id: []
        });
        this.redirect("/rooms");
    }
    return new_room;
};


/**
 * Parse the iBeacon id to add it to a room and return to the Rooms page.
 */
exports.add_to_room = function(){
    function *add_to_room(){
        var post = yield parse(this);
        var present = false;
        var room_index;
        for(var i = 0; i < db.rooms.length; i++){//find the position of the exhibition
            if(post.room_id == db.rooms[i].id) {
                room_index = i;
                break;
            }
        }

        for(var i = 0; i < db.rooms[room_index].current_id.length; i++){//check if its already in the list
            if(post.ibeacon_id == db.rooms[room_index].current_id[i]) {
                present = true;
                break;
            }
        }
        if(!present) db.rooms[room_index].current_id.push({id:post.ibeacon_id}); //if not, add it
        this.redirect("/room/" + post.room_id);
    }
    return add_to_room;
};


/**
 * Parse the iBeacon id to remove an iBeacon from the room and return to the Single Rooms page.
 */
exports.remove_ibeacon = function(){
    function *remove_ibeacon(){
        var post = yield parse(this);
        var room_index;
        for(var i = 0; i < db.rooms.length; i++){//find the position of the exhibition
            if(post.room_id == db.rooms[i].id) {
                room_index = i;
                break;
            }
        }
        for(var i = 0; i < db.rooms[room_index].current_id.length; i++){//check if its already in the list
            if(post.ibeacon_id == db.rooms[room_index].current_id[i].id) {
                db.rooms[room_index].current_id.splice(i, 1);
                break;
            }
        }
        this.redirect("/room/" + post.room_id);
    }
    return remove_ibeacon;
};
