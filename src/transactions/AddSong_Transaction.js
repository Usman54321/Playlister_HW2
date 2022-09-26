import { jsTPS_Transaction} from "../common/jsTPS";

export default class AddSong_Transaction
extends jsTPS_Transaction {
    constructor(initApp, initNewSong) {
        super();
        this.app = initApp;
        this.newSong = initNewSong;
    }

    doTransaction() {
        this.id = this.app.addSong();
    }
    
    undoTransaction() {
        this.app.deleteSong(this.id);
    }
}