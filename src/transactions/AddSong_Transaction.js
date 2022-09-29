import { jsTPS_Transaction} from "../common/jsTPS";

export default class AddSong_Transaction extends jsTPS_Transaction {
    constructor(initApp) {
        super();
        this.app = initApp;
    }

    doTransaction() {
        this.id = this.app.addSong();
        console.log("Added default song at " + this.id)
    }
    
    undoTransaction() {
        this.app.deleteSpecificSong(this.id);
        console.log("Deleted default song at " + this.id)
    }
}