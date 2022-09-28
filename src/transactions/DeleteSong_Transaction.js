import jsTPS from "../common/jsTPS";

export default class DeleteSong_Transaction extends jsTPS {
    constructor(initApp, initID) {
        super();
        this.app = initApp;
        this.id = initID;
    }

    doTransaction() {
        this.song = this.app.deleteSong();
        console.log("Deleted Song: " + this.song);
    }
    
    undoTransaction() {
        this.app.addSpecificSong(this.song, this.id);
        console.log("Added back the Song " + this.song + " at " + this.id)
    }
}