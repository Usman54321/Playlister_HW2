import jsTPS from "../common/jsTPS";

export default class EditSong_Transaction extends jsTPS {
    constructor(initApp, initID, initNewSong) {
        super();
        this.app = initApp;
        this.id = initID;
        this.newSong = initNewSong;
        this.oldSong = this.app.state.currentList.songs[this.id];
    }

    doTransaction() {
        this.app.editSong(this.id, this.newSong);
        console.log("Edited Song at " + this.id + " to " + JSON.stringify(this.newSong));
    }

    undoTransaction() {
        this.app.editSong(this.id, this.oldSong);
        console.log("Edited back the Song at " + this.id + " to " + JSON.stringify(this.oldSong));
    }
}