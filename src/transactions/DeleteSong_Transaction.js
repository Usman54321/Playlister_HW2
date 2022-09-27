import jsTPS from "../common/jsTPS";

export default class DeleteSong_Transaction extends jsTPS {
    constructor(initApp, initID) {
        super();
        this.app = initApp;
        this.id = initID;
    }

    doTransaction() {
        this.song = this.app.deleteSong();
    }
    
    undoTransaction() {
        this.app.addSpecificSong(this.song, this.id);
    }
}